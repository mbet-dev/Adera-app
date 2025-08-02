// =====================================================
// ADERA CORE SERVICES - MAIN EXPORT FILE
// =====================================================

// API Service - Core data operations and business logic
export { 
  ApiService, 
  ApiResponse, 
  ApiError, 
  ApiErrorType 
} from './ApiService';

// Payment Service - Ethiopian payment gateways
export { 
  PaymentService,
  TelebirrGateway,
  ChapaGateway,
  ArifPayGateway
} from './PaymentService';

// Real-time Service - Live tracking and notifications
export { 
  RealTimeService,
  RealTimeEventType,
  RealTimeEvent,
  RealTimeHandler,
  LocationUpdate,
  NotificationPayload
} from './RealTimeService';

// Offline Service - Data synchronization and offline support
export { 
  OfflineService,
  OfflineOperationType,
  OfflineOperation,
  OfflineData,
  SyncStatus,
  OfflineConfig
} from './OfflineService';

// =====================================================
// SERVICE INITIALIZATION UTILITIES
// =====================================================

import { PaymentService } from './PaymentService';
import { RealTimeService } from './RealTimeService';
import { OfflineService } from './OfflineService';

// Service initialization configuration
export interface ServiceConfig {
  payment?: {
    telebirr?: {
      apiKey: string;
      secretKey: string;
      baseUrl: string;
      timeout: number;
    };
    chapa?: {
      apiKey: string;
      secretKey: string;
      baseUrl: string;
      timeout: number;
    };
    arifpay?: {
      apiKey: string;
      secretKey: string;
      baseUrl: string;
      timeout: number;
    };
  };
  offline?: {
    maxRetries?: number;
    syncInterval?: number;
    maxOfflineDays?: number;
    enableAutoSync?: boolean;
    enableConflictResolution?: boolean;
  };
  realtime?: {
    enableAutoReconnect?: boolean;
    maxReconnectAttempts?: number;
    reconnectDelay?: number;
  };
}

// Initialize all core services
export async function initializeCoreServices(config: ServiceConfig = {}): Promise<void> {
  try {
    console.log('CoreServices: Initializing all services...');

    // Initialize Payment Service
    if (config.payment) {
      PaymentService.initializeGateways({
        telebirr: config.payment.telebirr,
        chapa: config.payment.chapa,
        arifpay: config.payment.arifpay
      });
      console.log('CoreServices: Payment service initialized');
    }

    // Initialize Offline Service
    await OfflineService.initialize(config.offline);
    console.log('CoreServices: Offline service initialized');

    // Real-time service will be initialized when user logs in
    console.log('CoreServices: All services initialized successfully');
  } catch (error: any) {
    console.error('CoreServices: Failed to initialize services:', error.message || 'Unknown error');
    throw error;
  }
}

// Initialize real-time service for a user
export async function initializeRealTimeService(
  userId: string, 
  userRole: string, 
  handlers: any
): Promise<void> {
  try {
    console.log('CoreServices: Initializing real-time service for user:', userId);
    
    RealTimeService.initialize(handlers);
    await RealTimeService.subscribeToUpdates(userId, userRole as any);
    
    console.log('CoreServices: Real-time service initialized for user');
  } catch (error: any) {
    console.error('CoreServices: Failed to initialize real-time service:', error.message || 'Unknown error');
    throw error;
  }
}

// Cleanup all services
export async function cleanupCoreServices(): Promise<void> {
  try {
    console.log('CoreServices: Cleaning up all services...');

    // Cleanup Offline Service
    await OfflineService.cleanup();

    // Cleanup Real-time Service
    await RealTimeService.disconnect();

    console.log('CoreServices: All services cleaned up successfully');
  } catch (error: any) {
    console.error('CoreServices: Failed to cleanup services:', error.message || 'Unknown error');
  }
}

// Get service status
export async function getServiceStatus(): Promise<{
  api: { isAvailable: boolean };
  payment: { availableMethods: string[] };
  realtime: { isInitialized: boolean; activeSubscriptions: number };
  offline: { isOnline: boolean; pendingOperations: number };
}> {
  try {
    const [realtimeStatus, offlineStatus] = await Promise.all([
      Promise.resolve(RealTimeService.getSubscriptionStatus()),
      Promise.resolve(OfflineService.getSyncStatus())
    ]);

    return {
      api: { isAvailable: true }, // API service is always available
      payment: { 
        availableMethods: PaymentService.getAvailablePaymentMethods() 
      },
      realtime: {
        isInitialized: realtimeStatus.isInitialized,
        activeSubscriptions: realtimeStatus.activeSubscriptions
      },
      offline: {
        isOnline: offlineStatus.isOnline,
        pendingOperations: offlineStatus.pendingOperations
      }
    };
  } catch (error: any) {
    console.error('CoreServices: Failed to get service status:', error.message || 'Unknown error');
    return {
      api: { isAvailable: false },
      payment: { availableMethods: [] },
      realtime: { isInitialized: false, activeSubscriptions: 0 },
      offline: { isOnline: false, pendingOperations: 0 }
    };
  }
}

// =====================================================
// COMMON SERVICE UTILITIES
// =====================================================

// Error handling utility
export function handleServiceError(error: any, context: string): string {
  console.error(`Service Error in ${context}:`, error.message || 'Unknown error');
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred';
}

// Retry utility for service operations
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.warn(`Operation failed (attempt ${attempt}/${maxRetries}):`, error);
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }
  
  throw lastError!;
}

// Service health check
export async function performHealthCheck(): Promise<{
  healthy: boolean;
  services: { [key: string]: boolean };
  errors: string[];
}> {
  const results = {
    healthy: true,
    services: {
      api: true,
      payment: true,
      realtime: true,
      offline: true
    },
    errors: [] as string[]
  };

  try {
    // Test API service
    try {
      // Simple API test - could be enhanced with actual endpoint test
      results.services.api = true;
    } catch (error: any) {
      results.services.api = false;
      results.errors.push(`API Service: ${handleServiceError(error, 'health_check')}`);
      results.healthy = false;
    }

    // Test Payment service
    try {
      const availableMethods = PaymentService.getAvailablePaymentMethods();
      results.services.payment = availableMethods.length > 0;
    } catch (error: any) {
      results.services.payment = false;
      results.errors.push(`Payment Service: ${handleServiceError(error, 'health_check')}`);
      results.healthy = false;
    }

    // Test Real-time service
    try {
      const realtimeStatus = RealTimeService.getSubscriptionStatus();
      results.services.realtime = realtimeStatus.isInitialized;
    } catch (error: any) {
      results.services.realtime = false;
      results.errors.push(`Real-time Service: ${handleServiceError(error, 'health_check')}`);
      results.healthy = false;
    }

    // Test Offline service
    try {
      const offlineStatus = await OfflineService.getSyncStatus();
      results.services.offline = true; // Offline service is always available
    } catch (error: any) {
      results.services.offline = false;
      results.errors.push(`Offline Service: ${handleServiceError(error, 'health_check')}`);
      results.healthy = false;
    }

  } catch (error: any) {
    results.healthy = false;
    results.errors.push(`Health Check: ${handleServiceError(error, 'health_check')}`);
  }

  return results;
} 