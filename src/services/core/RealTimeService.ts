import { supabase } from '../../lib/supabase';
import { 
  Parcel, 
  ParcelEvent, 
  Notification, 
  NotificationType,
  UserRole,
  ParcelStatus,
  PaymentStatus
} from '../../types';
import { ApiService, ApiResponse } from './ApiService';

// Real-time event types
export enum RealTimeEventType {
  PARCEL_STATUS_UPDATE = 'parcel_status_update',
  DRIVER_LOCATION_UPDATE = 'driver_location_update',
  PAYMENT_STATUS_UPDATE = 'payment_status_update',
  NEW_NOTIFICATION = 'new_notification',
  CHAT_MESSAGE = 'chat_message',
  SYSTEM_ALERT = 'system_alert'
}

// Real-time event payload
export interface RealTimeEvent {
  type: RealTimeEventType;
  data: any;
  timestamp: string;
  userId?: string;
}

// Real-time subscription handler
export interface RealTimeHandler {
  onParcelStatusUpdate?: (parcel: Parcel, event: ParcelEvent) => void;
  onDriverLocationUpdate?: (driverId: string, location: { latitude: number; longitude: number }) => void;
  onPaymentStatusUpdate?: (transactionId: string, status: PaymentStatus) => void;
  onNewNotification?: (notification: Notification) => void;
  onChatMessage?: (message: any) => void;
  onSystemAlert?: (alert: any) => void;
  onError?: (error: Error) => void;
}

// Location tracking interface
export interface LocationUpdate {
  driverId: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  accuracy?: number;
  speed?: number;
  heading?: number;
}

// Notification payload
export interface NotificationPayload {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  relatedId?: string;
  relatedType?: string;
  data?: any;
}

// =====================================================
// REAL-TIME SERVICE
// =====================================================

export class RealTimeService {
  private static subscriptions: Map<string, any> = new Map();
  private static handlers: RealTimeHandler = {};
  private static isInitialized = false;
  private static reconnectAttempts = 0;
  private static maxReconnectAttempts = 5;
  private static reconnectDelay = 1000; // 1 second

  // Initialize real-time service
  static initialize(handlers: RealTimeHandler): void {
    this.handlers = handlers;
    this.isInitialized = true;
    console.log('RealTimeService: Initialized');
  }

  // Subscribe to real-time updates
  static async subscribeToUpdates(userId: string, userRole: UserRole): Promise<void> {
    try {
      console.log('RealTimeService: Subscribing to updates for user:', userId, 'role:', userRole);

      // Subscribe to parcel updates
      await this.subscribeToParcelUpdates(userId, userRole);

      // Subscribe to notifications
      await this.subscribeToNotifications(userId);

      // Subscribe to chat messages
      await this.subscribeToChatMessages(userId);

      // Subscribe to system alerts
      await this.subscribeToSystemAlerts(userRole);

      console.log('RealTimeService: Successfully subscribed to all updates');
    } catch (error: any) {
      console.error('RealTimeService: Failed to subscribe to updates:', error.message || 'Unknown error');
      this.handlers.onError?.(error as Error);
    }
  }

  // Subscribe to parcel status updates
  private static async subscribeToParcelUpdates(userId: string, userRole: UserRole): Promise<void> {
    try {
      let channel;

      switch (userRole) {
        case UserRole.CUSTOMER:
          // Customers subscribe to their own parcels
          channel = supabase
            .channel(`parcels_${userId}`)
            .on(
              'postgres_changes',
              {
                event: '*',
                schema: 'public',
                table: 'parcels',
                filter: `sender_id=eq.${userId}`
              },
              async (payload) => {
                await this.handleParcelUpdate(payload);
              }
            )
            .on(
              'postgres_changes',
              {
                event: '*',
                schema: 'public',
                table: 'parcel_events',
                filter: `parcel_id=in.(select id from parcels where sender_id='${userId}')`
              },
              async (payload) => {
                await this.handleParcelEventUpdate(payload);
              }
            );
          break;

        case UserRole.PARTNER:
          // Partners subscribe to parcels assigned to them
          channel = supabase
            .channel(`partner_parcels_${userId}`)
            .on(
              'postgres_changes',
              {
                event: '*',
                schema: 'public',
                table: 'parcels',
                filter: `dropoff_partner_id=eq.${userId} OR pickup_partner_id=eq.${userId}`
              },
              async (payload) => {
                await this.handleParcelUpdate(payload);
              }
            );
          break;

        case UserRole.DRIVER:
          // Drivers subscribe to parcels assigned to them
          channel = supabase
            .channel(`driver_parcels_${userId}`)
            .on(
              'postgres_changes',
              {
                event: '*',
                schema: 'public',
                table: 'parcels',
                filter: `assigned_driver_id=eq.${userId}`
              },
              async (payload) => {
                await this.handleParcelUpdate(payload);
              }
            );
          break;

        case UserRole.ADMIN:
          // Admins subscribe to all parcels
          channel = supabase
            .channel(`admin_parcels`)
            .on(
              'postgres_changes',
              {
                event: '*',
                schema: 'public',
                table: 'parcels'
              },
              async (payload) => {
                await this.handleParcelUpdate(payload);
              }
            );
          break;
      }

      if (channel) {
        const subscription = await channel.subscribe();
        this.subscriptions.set(`parcels_${userId}`, subscription);
      }
    } catch (error: any) {
      console.error('RealTimeService: Failed to subscribe to parcel updates:', error.message || 'Unknown error');
      throw error;
    }
  }

  // Subscribe to notifications
  private static async subscribeToNotifications(userId: string): Promise<void> {
    try {
      const channel = supabase
        .channel(`notifications_${userId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`
          },
          async (payload) => {
            await this.handleNotificationUpdate(payload);
          }
        );

      const subscription = await channel.subscribe();
      this.subscriptions.set(`notifications_${userId}`, subscription);
    } catch (error: any) {
      console.error('RealTimeService: Failed to subscribe to notifications:', error.message || 'Unknown error');
      throw error;
    }
  }

  // Subscribe to chat messages
  private static async subscribeToChatMessages(userId: string): Promise<void> {
    try {
      const channel = supabase
        .channel(`chat_${userId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `receiver_id=eq.${userId}`
          },
          async (payload) => {
            await this.handleChatMessage(payload);
          }
        );

      const subscription = await channel.subscribe();
      this.subscriptions.set(`chat_${userId}`, subscription);
    } catch (error: any) {
      console.error('RealTimeService: Failed to subscribe to chat messages:', error.message || 'Unknown error');
      throw error;
    }
  }

  // Subscribe to system alerts
  private static async subscribeToSystemAlerts(userRole: UserRole): Promise<void> {
    try {
      if (userRole === UserRole.ADMIN) {
        const channel = supabase
          .channel(`system_alerts`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'system_settings'
            },
            async (payload) => {
              await this.handleSystemAlert(payload);
            }
          );

        const subscription = await channel.subscribe();
        this.subscriptions.set('system_alerts', subscription);
      }
    } catch (error: any) {
      console.error('RealTimeService: Failed to subscribe to system alerts:', error.message || 'Unknown error');
      throw error;
    }
  }

  // Handle parcel updates
  private static async handleParcelUpdate(payload: any): Promise<void> {
    try {
      console.log('RealTimeService: Parcel update received:', payload);

      const parcel = payload.new as Parcel;
      const eventType = payload.eventType;

      // Get full parcel details if needed
      if (parcel.tracking_id) {
        const parcelResponse = await ApiService.getParcelDetails(parcel.tracking_id);
        if (parcelResponse.success && parcelResponse.data) {
          this.handlers.onParcelStatusUpdate?.(parcelResponse.data, null as any);
        }
      }

      // Send push notification for status changes
      if (eventType === 'UPDATE' && payload.old?.status !== payload.new?.status) {
        await this.sendStatusUpdateNotification(parcel);
      }
    } catch (error: any) {
      console.error('RealTimeService: Error handling parcel update:', error.message || 'Unknown error');
      this.handlers.onError?.(error as Error);
    }
  }

  // Handle parcel event updates
  private static async handleParcelEventUpdate(payload: any): Promise<void> {
    try {
      console.log('RealTimeService: Parcel event update received:', payload);

      const event = payload.new as ParcelEvent;
      
      // Get parcel details
      const parcelResponse = await ApiService.getParcelDetails(event.parcel_id);
      if (parcelResponse.success && parcelResponse.data) {
        this.handlers.onParcelStatusUpdate?.(parcelResponse.data, event);
      }
    } catch (error: any) {
      console.error('RealTimeService: Error handling parcel event update:', error.message || 'Unknown error');
      this.handlers.onError?.(error as Error);
    }
  }

  // Handle notification updates
  private static async handleNotificationUpdate(payload: any): Promise<void> {
    try {
      console.log('RealTimeService: Notification received:', payload);

      const notification = payload.new as Notification;
      
      // Call notification handler
      this.handlers.onNewNotification?.(notification);

      // Send push notification
      await this.sendPushNotification(notification);
    } catch (error: any) {
      console.error('RealTimeService: Error handling notification update:', error.message || 'Unknown error');
      this.handlers.onError?.(error as Error);
    }
  }

  // Handle chat messages
  private static async handleChatMessage(payload: any): Promise<void> {
    try {
      console.log('RealTimeService: Chat message received:', payload);

      const message = payload.new;
      
      // Call chat message handler
      this.handlers.onChatMessage?.(message);

      // Send push notification for new messages
      await this.sendChatNotification(message);
    } catch (error: any) {
      console.error('RealTimeService: Error handling chat message:', error.message || 'Unknown error');
      this.handlers.onError?.(error as Error);
    }
  }

  // Handle system alerts
  private static async handleSystemAlert(payload: any): Promise<void> {
    try {
      console.log('RealTimeService: System alert received:', payload);

      const alert = payload.new;
      
      // Call system alert handler
      this.handlers.onSystemAlert?.(alert);
    } catch (error: any) {
      console.error('RealTimeService: Error handling system alert:', error.message || 'Unknown error');
      this.handlers.onError?.(error as Error);
    }
  }

  // Update driver location
  static async updateDriverLocation(update: LocationUpdate): Promise<ApiResponse<void>> {
    try {
      console.log('RealTimeService: Updating driver location:', update);

      const { error } = await supabase
        .from('drivers')
        .update({
          current_latitude: update.latitude,
          current_longitude: update.longitude,
          last_location_update: update.timestamp
        })
        .eq('user_id', update.driverId);

      if (error) throw error;

      // Broadcast location update to relevant subscribers
      await this.broadcastLocationUpdate(update);

      return { data: null, error: null, success: true };
    } catch (error: any) {
      console.error('RealTimeService: Error updating driver location:', error.message || 'Unknown error');
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to update location',
        success: false
      };
    }
  }

  // Broadcast location update
  private static async broadcastLocationUpdate(update: LocationUpdate): Promise<void> {
    try {
      // Send to Supabase real-time channel
      await supabase.channel('driver_locations').send({
        type: 'broadcast',
        event: 'driver_location_update',
        payload: update
      });

      // Call handler
      this.handlers.onDriverLocationUpdate?.(update.driverId, {
        latitude: update.latitude,
        longitude: update.longitude
      });
    } catch (error: any) {
      console.error('RealTimeService: Error broadcasting location update:', error.message || 'Unknown error');
    }
  }

  // Send notification
  static async sendNotification(payload: NotificationPayload): Promise<ApiResponse<Notification>> {
    try {
      console.log('RealTimeService: Sending notification:', payload);

      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: payload.userId,
          title: payload.title,
          message: payload.message,
          notification_type: payload.type,
          related_id: payload.relatedId,
          related_type: payload.relatedType,
          is_read: false,
          is_sent: false,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return { data, error: null, success: true };
    } catch (error: any) {
      console.error('RealTimeService: Error sending notification:', error.message || 'Unknown error');
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to send notification',
        success: false
      };
    }
  }

  // Send status update notification
  private static async sendStatusUpdateNotification(parcel: Parcel): Promise<void> {
    try {
      const statusMessages = {
        [ParcelStatus.CREATED]: 'Parcel created',
        [ParcelStatus.DROPOFF]: 'Parcel dropped off',
        [ParcelStatus.FACILITY_RECEIVED]: 'Parcel received at facility',
        [ParcelStatus.IN_TRANSIT_TO_FACILITY_HUB]: 'Parcel in transit to facility hub',
        [ParcelStatus.IN_TRANSIT_TO_PICKUP_POINT]: 'Parcel in transit to pickup point',
        [ParcelStatus.PICKUP_READY]: 'Parcel ready for pickup',
        [ParcelStatus.ASSIGNED_TO_DRIVER]: 'Parcel assigned to driver',
        [ParcelStatus.OUT_FOR_DELIVERY]: 'Parcel out for delivery',
        [ParcelStatus.DELIVERED]: 'Parcel delivered',
        [ParcelStatus.CANCELLED]: 'Parcel cancelled',
        [ParcelStatus.DISPUTED]: 'Parcel disputed'
      };

      const message = statusMessages[parcel.status] || 'Your parcel status has been updated';

      await this.sendNotification({
        userId: parcel.sender_id,
        title: 'Parcel Status Update',
        message,
        type: NotificationType.STATUS_UPDATE,
        relatedId: parcel.id,
        relatedType: 'parcel'
      });
    } catch (error: any) {
      console.error('RealTimeService: Error sending status update notification:', error.message || 'Unknown error');
    }
  }

  // Send push notification
  private static async sendPushNotification(notification: Notification): Promise<void> {
    try {
      // This would integrate with a push notification service like Expo Notifications
      // For now, we'll just log the notification
      console.log('RealTimeService: Push notification would be sent:', {
        title: notification.title,
        message: notification.message,
        userId: notification.user_id
      });

      // Update notification as sent
      await supabase
        .from('notifications')
        .update({ is_sent: true, sent_at: new Date().toISOString() })
        .eq('id', notification.id);
    } catch (error: any) {
      console.error('RealTimeService: Error sending push notification:', error.message || 'Unknown error');
    }
  }

  // Send chat notification
  private static async sendChatNotification(message: any): Promise<void> {
    try {
      await this.sendNotification({
        userId: message.receiver_id,
        title: 'New Message',
        message: `You have a new message from ${message.sender_name || 'a driver'}`,
        type: NotificationType.SYSTEM_ALERT,
        relatedId: message.parcel_id,
        relatedType: 'parcel'
      });
    } catch (error: any) {
      console.error('RealTimeService: Error sending chat notification:', error.message || 'Unknown error');
    }
  }

  // Unsubscribe from all updates
  static async unsubscribeFromUpdates(userId: string): Promise<void> {
    try {
      console.log('RealTimeService: Unsubscribing from updates for user:', userId);

      // Unsubscribe from all channels
      for (const [key, subscription] of this.subscriptions.entries()) {
        if (key.includes(userId) || key === 'system_alerts') {
          await supabase.removeChannel(subscription);
          this.subscriptions.delete(key);
        }
      }

      console.log('RealTimeService: Successfully unsubscribed from all updates');
    } catch (error: any) {
      console.error('RealTimeService: Error unsubscribing from updates:', error.message || 'Unknown error');
    }
  }

  // Disconnect all subscriptions
  static async disconnect(): Promise<void> {
    try {
      console.log('RealTimeService: Disconnecting all subscriptions');

      // Remove all channels
      for (const [key, subscription] of this.subscriptions.entries()) {
        await supabase.removeChannel(subscription);
      }

      this.subscriptions.clear();
      this.isInitialized = false;

      console.log('RealTimeService: Successfully disconnected all subscriptions');
    } catch (error: any) {
      console.error('RealTimeService: Error disconnecting subscriptions:', error.message || 'Unknown error');
    }
  }

  // Get subscription status
  static getSubscriptionStatus(): { isInitialized: boolean; activeSubscriptions: number } {
    return {
      isInitialized: this.isInitialized,
      activeSubscriptions: this.subscriptions.size
    };
  }

  // Reconnect with exponential backoff
  static async reconnect(userId: string, userRole: UserRole): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('RealTimeService: Max reconnection attempts reached');
      return;
    }

    try {
      console.log(`RealTimeService: Attempting to reconnect (attempt ${this.reconnectAttempts + 1})`);

      // Wait before reconnecting
      await new Promise(resolve => setTimeout(resolve, this.reconnectDelay * Math.pow(2, this.reconnectAttempts)));

      // Disconnect existing subscriptions
      await this.disconnect();

      // Reconnect
      await this.subscribeToUpdates(userId, userRole);

      this.reconnectAttempts = 0;
      console.log('RealTimeService: Successfully reconnected');
    } catch (error: any) {
      console.error('RealTimeService: Reconnection failed:', error.message || 'Unknown error');
      this.reconnectAttempts++;
      
      // Try again
      setTimeout(() => this.reconnect(userId, userRole), this.reconnectDelay);
    }
  }
} 