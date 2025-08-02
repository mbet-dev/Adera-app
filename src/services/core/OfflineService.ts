import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { 
  Parcel, 
  ParcelEvent, 
  Transaction, 
  User,
  ParcelStatus,
  PaymentStatus,
  CreateParcelRequest,
  UpdateParcelStatusRequest
} from '../../types';
import { ApiService, ApiResponse } from './ApiService';

// Offline operation types
export enum OfflineOperationType {
  CREATE_PARCEL = 'create_parcel',
  UPDATE_PARCEL_STATUS = 'update_parcel_status',
  CREATE_PARCEL_EVENT = 'create_parcel_event',
  UPDATE_WALLET_BALANCE = 'update_wallet_balance',
  CREATE_TRANSACTION = 'create_transaction',
  UPDATE_USER_PROFILE = 'update_user_profile'
}

// Offline operation interface
export interface OfflineOperation {
  id: string;
  type: OfflineOperationType;
  data: any;
  timestamp: string;
  retryCount: number;
  maxRetries: number;
  priority: number; // Higher number = higher priority
  dependencies?: string[]; // IDs of operations this depends on
}

// Offline data interface
export interface OfflineData {
  parcels: Parcel[];
  parcelEvents: ParcelEvent[];
  transactions: Transaction[];
  userProfile: User | null;
  walletBalance: number;
  lastSyncTimestamp: string;
}

// Sync status interface
export interface SyncStatus {
  isOnline: boolean;
  lastSyncTime: string;
  pendingOperations: number;
  syncInProgress: boolean;
  lastError: string | null;
}

// Offline service configuration
export interface OfflineConfig {
  maxRetries: number;
  syncInterval: number; // milliseconds
  maxOfflineDays: number;
  enableAutoSync: boolean;
  enableConflictResolution: boolean;
}

// =====================================================
// OFFLINE SERVICE
// =====================================================

export class OfflineService {
  private static readonly STORAGE_KEYS = {
    OFFLINE_OPERATIONS: 'adera_offline_operations',
    OFFLINE_DATA: 'adera_offline_data',
    SYNC_STATUS: 'adera_sync_status',
    CONFIG: 'adera_offline_config'
  };

  private static config: OfflineConfig = {
    maxRetries: 3,
    syncInterval: 30000, // 30 seconds
    maxOfflineDays: 7,
    enableAutoSync: true,
    enableConflictResolution: true
  };

  private static syncInProgress = false;
  private static syncIntervalId: NodeJS.Timeout | null = null;
  private static networkListener: any = null;

  // Initialize offline service
  static async initialize(customConfig?: Partial<OfflineConfig>): Promise<void> {
    try {
      console.log('OfflineService: Initializing...');

      // Load configuration
      if (customConfig) {
        this.config = { ...this.config, ...customConfig };
      }

      // Load saved config
      const savedConfig = await this.loadConfig();
      if (savedConfig) {
        this.config = { ...this.config, ...savedConfig };
      }

      // Save configuration
      await this.saveConfig();

      // Setup network listener
      await this.setupNetworkListener();

      // Start auto-sync if enabled
      if (this.config.enableAutoSync) {
        this.startAutoSync();
      }

      console.log('OfflineService: Initialized successfully');
    } catch (error: any) {
      console.error('OfflineService: Initialization failed:', error.message || 'Unknown error');
      throw error;
    }
  }

  // Setup network connectivity listener
  private static async setupNetworkListener(): Promise<void> {
    try {
      this.networkListener = NetInfo.addEventListener(state => {
        console.log('OfflineService: Network state changed:', state.isConnected);
        
        if (state.isConnected) {
          this.onNetworkConnected();
        } else {
          this.onNetworkDisconnected();
        }
      });
    } catch (error: any) {
      console.error('OfflineService: Failed to setup network listener:', error.message || 'Unknown error');
    }
  }

  // Handle network connection
  private static async onNetworkConnected(): Promise<void> {
    try {
      console.log('OfflineService: Network connected, starting sync...');
      
      // Update sync status
      await this.updateSyncStatus({ isOnline: true });

      // Perform immediate sync
      await this.syncOfflineOperations();

      // Start auto-sync if not already running
      if (this.config.enableAutoSync && !this.syncIntervalId) {
        this.startAutoSync();
      }
    } catch (error: any) {
      console.error('OfflineService: Error handling network connection:', error.message || 'Unknown error');
    }
  }

  // Handle network disconnection
  private static async onNetworkDisconnected(): Promise<void> {
    try {
      console.log('OfflineService: Network disconnected');
      
      // Update sync status
      await this.updateSyncStatus({ isOnline: false });

      // Stop auto-sync
      this.stopAutoSync();
    } catch (error: any) {
      console.error('OfflineService: Error handling network disconnection:', error.message || 'Unknown error');
    }
  }

  // Start auto-sync
  private static startAutoSync(): void {
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
    }

    this.syncIntervalId = setInterval(async () => {
      const status = await this.getSyncStatus();
      if (status.isOnline && !status.syncInProgress) {
        await this.syncOfflineOperations();
      }
    }, this.config.syncInterval);

    console.log('OfflineService: Auto-sync started');
  }

  // Stop auto-sync
  private static stopAutoSync(): void {
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
      this.syncIntervalId = null;
    }
    console.log('OfflineService: Auto-sync stopped');
  }

  // Queue offline operation
  static async queueOperation(operation: Omit<OfflineOperation, 'id' | 'timestamp' | 'retryCount'>): Promise<string> {
    try {
      const offlineOperation: OfflineOperation = {
        ...operation,
        id: this.generateOperationId(),
        timestamp: new Date().toISOString(),
        retryCount: 0
      };

      const operations = await this.getOfflineOperations();
      operations.push(offlineOperation);

      // Sort by priority (higher priority first)
      operations.sort((a, b) => b.priority - a.priority);

      await this.saveOfflineOperations(operations);

      console.log('OfflineService: Operation queued:', offlineOperation.id, offlineOperation.type);

      return offlineOperation.id;
    } catch (error: any) {
      console.error('OfflineService: Failed to queue operation:', error.message || 'Unknown error');
      throw error;
    }
  }

  // Sync offline operations
  static async syncOfflineOperations(): Promise<void> {
    if (this.syncInProgress) {
      console.log('OfflineService: Sync already in progress, skipping...');
      return;
    }

    try {
      this.syncInProgress = true;
      await this.updateSyncStatus({ syncInProgress: true });

      console.log('OfflineService: Starting offline operations sync...');

      const operations = await this.getOfflineOperations();
      const status = await this.getSyncStatus();

      if (!status.isOnline) {
        console.log('OfflineService: No network connection, skipping sync');
        return;
      }

      let successCount = 0;
      let errorCount = 0;

      for (const operation of operations) {
        try {
          // Check dependencies
          if (operation.dependencies && operation.dependencies.length > 0) {
            const pendingDependencies = operation.dependencies.filter(depId => 
              operations.some(op => op.id === depId && op.retryCount < op.maxRetries)
            );
            
            if (pendingDependencies.length > 0) {
              console.log('OfflineService: Skipping operation due to pending dependencies:', operation.id);
              continue;
            }
          }

          // Execute operation
          await this.executeOperation(operation);
          successCount++;

          // Remove successful operation
          await this.removeOperation(operation.id);
        } catch (error: any) {
          console.error('OfflineService: Operation failed:', operation.id, error.message || 'Unknown error');
          errorCount++;

          // Increment retry count
          operation.retryCount++;
          
          if (operation.retryCount >= operation.maxRetries) {
            console.log('OfflineService: Operation exceeded max retries, removing:', operation.id);
            await this.removeOperation(operation.id);
          } else {
            // Update operation with new retry count
            await this.updateOperation(operation);
          }
        }
      }

      console.log(`OfflineService: Sync completed. Success: ${successCount}, Errors: ${errorCount}`);

      // Update last sync time
      await this.updateSyncStatus({ 
        syncInProgress: false,
        lastSyncTime: new Date().toISOString(),
        lastError: errorCount > 0 ? `${errorCount} operations failed` : null
      });
    } catch (error: any) {
      console.error('OfflineService: Sync failed:', error.message || 'Unknown error');
      await this.updateSyncStatus({ 
        syncInProgress: false,
        lastError: error instanceof Error ? error.message : 'Sync failed'
      });
    } finally {
      this.syncInProgress = false;
    }
  }

  // Execute offline operation
  private static async executeOperation(operation: OfflineOperation): Promise<void> {
    console.log('OfflineService: Executing operation:', operation.type, operation.id);

    switch (operation.type) {
      case OfflineOperationType.CREATE_PARCEL:
        await this.executeCreateParcel(operation.data);
        break;

      case OfflineOperationType.UPDATE_PARCEL_STATUS:
        await this.executeUpdateParcelStatus(operation.data);
        break;

      case OfflineOperationType.CREATE_PARCEL_EVENT:
        await this.executeCreateParcelEvent(operation.data);
        break;

      case OfflineOperationType.UPDATE_WALLET_BALANCE:
        await this.executeUpdateWalletBalance(operation.data);
        break;

      case OfflineOperationType.CREATE_TRANSACTION:
        await this.executeCreateTransaction(operation.data);
        break;

      case OfflineOperationType.UPDATE_USER_PROFILE:
        await this.executeUpdateUserProfile(operation.data);
        break;

      default:
        throw new Error(`Unknown operation type: ${operation.type}`);
    }
  }

  // Execute create parcel operation
  private static async executeCreateParcel(data: CreateParcelRequest & { userId: string }): Promise<void> {
    const response = await ApiService.createParcel(data, data.userId);
    if (!response.success) {
      throw new Error(response.error || 'Failed to create parcel');
    }
  }

  // Execute update parcel status operation
  private static async executeUpdateParcelStatus(data: UpdateParcelStatusRequest): Promise<void> {
    const response = await ApiService.updateParcelStatus(data);
    if (!response.success) {
      throw new Error(response.error || 'Failed to update parcel status');
    }
  }

  // Execute create parcel event operation
  private static async executeCreateParcelEvent(data: any): Promise<void> {
    const response = await ApiService.createParcelEvent(
      data.parcelId,
      data.eventType,
      data.actorId,
      data.actorRole,
      data.notes,
      data.location,
      data.images
    );
    if (!response.success) {
      throw new Error(response.error || 'Failed to create parcel event');
    }
  }

  // Execute update wallet balance operation
  private static async executeUpdateWalletBalance(data: { userId: string; newBalance: number }): Promise<void> {
    const response = await ApiService.updateWalletBalance(data.userId, data.newBalance);
    if (!response.success) {
      throw new Error(response.error || 'Failed to update wallet balance');
    }
  }

  // Execute create transaction operation
  private static async executeCreateTransaction(data: any): Promise<void> {
    const response = await ApiService.addTransaction(data);
    if (!response.success) {
      throw new Error(response.error || 'Failed to create transaction');
    }
  }

  // Execute update user profile operation
  private static async executeUpdateUserProfile(data: { userId: string; updates: any }): Promise<void> {
    const response = await ApiService.updateUserProfile(data.userId, data.updates);
    if (!response.success) {
      throw new Error(response.error || 'Failed to update user profile');
    }
  }

  // Cache data for offline access
  static async cacheData<T>(key: string, data: T): Promise<void> {
    try {
      const offlineData = await this.getOfflineData();
      
      // Update specific data
      (offlineData as any)[key] = data;
      offlineData.lastSyncTimestamp = new Date().toISOString();

      await this.saveOfflineData(offlineData);
      console.log('OfflineService: Data cached:', key);
    } catch (error: any) {
      console.error('OfflineService: Failed to cache data:', error.message || 'Unknown error');
    }
  }

  // Get cached data
  static async getCachedData<T>(key: string): Promise<T | null> {
    try {
      const offlineData = await this.getOfflineData();
      return (offlineData as any)[key] || null;
    } catch (error: any) {
      console.error('OfflineService: Failed to get cached data:', error.message || 'Unknown error');
      return null;
    }
  }

  // Clear old offline data
  static async clearOldData(): Promise<void> {
    try {
      const offlineData = await this.getOfflineData();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.config.maxOfflineDays);

      if (new Date(offlineData.lastSyncTimestamp) < cutoffDate) {
        console.log('OfflineService: Clearing old offline data');
        await this.clearOfflineData();
      }
    } catch (error: any) {
      console.error('OfflineService: Failed to clear old data:', error.message || 'Unknown error');
    }
  }

  // Get sync status
  static async getSyncStatus(): Promise<SyncStatus> {
    try {
      const statusJson = await AsyncStorage.getItem(this.STORAGE_KEYS.SYNC_STATUS);
      if (statusJson) {
        return JSON.parse(statusJson);
      }
      return {
        isOnline: false,
        lastSyncTime: '',
        pendingOperations: 0,
        syncInProgress: false,
        lastError: null
      };
    } catch (error: any) {
      console.error('OfflineService: Failed to get sync status:', error.message || 'Unknown error');
      return {
        isOnline: false,
        lastSyncTime: '',
        pendingOperations: 0,
        syncInProgress: false,
        lastError: null
      };
    }
  }

  // Update sync status
  private static async updateSyncStatus(updates: Partial<SyncStatus>): Promise<void> {
    try {
      const currentStatus = await this.getSyncStatus();
      const operations = await this.getOfflineOperations();
      
      const newStatus: SyncStatus = {
        ...currentStatus,
        ...updates,
        pendingOperations: operations.length
      };

      await AsyncStorage.setItem(this.STORAGE_KEYS.SYNC_STATUS, JSON.stringify(newStatus));
    } catch (error: any) {
      console.error('OfflineService: Failed to update sync status:', error.message || 'Unknown error');
    }
  }

  // Get offline operations
  private static async getOfflineOperations(): Promise<OfflineOperation[]> {
    try {
      const operationsJson = await AsyncStorage.getItem(this.STORAGE_KEYS.OFFLINE_OPERATIONS);
      return operationsJson ? JSON.parse(operationsJson) : [];
    } catch (error: any) {
      console.error('OfflineService: Failed to get offline operations:', error.message || 'Unknown error');
      return [];
    }
  }

  // Save offline operations
  private static async saveOfflineOperations(operations: OfflineOperation[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEYS.OFFLINE_OPERATIONS, JSON.stringify(operations));
    } catch (error: any) {
      console.error('OfflineService: Failed to save offline operations:', error.message || 'Unknown error');
    }
  }

  // Remove operation
  private static async removeOperation(operationId: string): Promise<void> {
    try {
      const operations = await this.getOfflineOperations();
      const filteredOperations = operations.filter(op => op.id !== operationId);
      await this.saveOfflineOperations(filteredOperations);
    } catch (error: any) {
      console.error('OfflineService: Failed to remove operation:', error.message || 'Unknown error');
    }
  }

  // Update operation
  private static async updateOperation(operation: OfflineOperation): Promise<void> {
    try {
      const operations = await this.getOfflineOperations();
      const index = operations.findIndex(op => op.id === operation.id);
      if (index !== -1) {
        operations[index] = operation;
        await this.saveOfflineOperations(operations);
      }
    } catch (error: any) {
      console.error('OfflineService: Failed to update operation:', error.message || 'Unknown error');
    }
  }

  // Get offline data
  private static async getOfflineData(): Promise<OfflineData> {
    try {
      const dataJson = await AsyncStorage.getItem(this.STORAGE_KEYS.OFFLINE_DATA);
      if (dataJson) {
        return JSON.parse(dataJson);
      }
      return {
        parcels: [],
        parcelEvents: [],
        transactions: [],
        userProfile: null,
        walletBalance: 0,
        lastSyncTimestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('OfflineService: Failed to get offline data:', error.message || 'Unknown error');
      return {
        parcels: [],
        parcelEvents: [],
        transactions: [],
        userProfile: null,
        walletBalance: 0,
        lastSyncTimestamp: new Date().toISOString()
      };
    }
  }

  // Save offline data
  private static async saveOfflineData(data: OfflineData): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEYS.OFFLINE_DATA, JSON.stringify(data));
    } catch (error: any) {
      console.error('OfflineService: Failed to save offline data:', error.message || 'Unknown error');
    }
  }

  // Clear offline data
  private static async clearOfflineData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.STORAGE_KEYS.OFFLINE_DATA);
      await AsyncStorage.removeItem(this.STORAGE_KEYS.OFFLINE_OPERATIONS);
      await AsyncStorage.removeItem(this.STORAGE_KEYS.SYNC_STATUS);
    } catch (error: any) {
      console.error('OfflineService: Failed to clear offline data:', error.message || 'Unknown error');
    }
  }

  // Load configuration
  private static async loadConfig(): Promise<Partial<OfflineConfig> | null> {
    try {
      const configJson = await AsyncStorage.getItem(this.STORAGE_KEYS.CONFIG);
      return configJson ? JSON.parse(configJson) : null;
    } catch (error: any) {
      console.error('OfflineService: Failed to load config:', error.message || 'Unknown error');
      return null;
    }
  }

  // Save configuration
  private static async saveConfig(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEYS.CONFIG, JSON.stringify(this.config));
    } catch (error: any) {
      console.error('OfflineService: Failed to save config:', error.message || 'Unknown error');
    }
  }

  // Generate operation ID
  private static generateOperationId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Cleanup resources
  static async cleanup(): Promise<void> {
    try {
      console.log('OfflineService: Cleaning up...');

      // Stop auto-sync
      this.stopAutoSync();

      // Remove network listener
      if (this.networkListener) {
        this.networkListener();
        this.networkListener = null;
      }

      // Clear old data
      await this.clearOldData();

      console.log('OfflineService: Cleanup completed');
    } catch (error: any) {
      console.error('OfflineService: Cleanup failed:', error.message || 'Unknown error');
    }
  }

  // Get pending operations count
  static async getPendingOperationsCount(): Promise<number> {
    try {
      const operations = await this.getOfflineOperations();
      return operations.length;
    } catch (error: any) {
      console.error('OfflineService: Failed to get pending operations count:', error.message || 'Unknown error');
      return 0;
    }
  }

  // Force manual sync
  static async forceSync(): Promise<void> {
    console.log('OfflineService: Force sync requested');
    await this.syncOfflineOperations();
  }
} 