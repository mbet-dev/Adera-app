export type UserRole = 'customer' | 'partner' | 'courier' | 'sorting' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

export interface Parcel {
  id: string;
  trackingId: string;
  senderId: string;
  recipientId: string;
  status: ParcelStatus;
  phase: ParcelPhase;
  createdAt: string;
  updatedAt: string;
}

export type ParcelStatus = 
  | 'pending'
  | 'in_transit'
  | 'at_hub'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type ParcelPhase = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface Partner {
  id: string;
  userId: string;
  businessName: string;
  address: string;
  type: 'dropoff' | 'pickup';
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Courier {
  id: string;
  userId: string;
  status: 'available' | 'busy' | 'offline';
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  parcelId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: 'telebirr' | 'chapa' | 'arifpay' | 'cod';
  createdAt: string;
  updatedAt: string;
} 