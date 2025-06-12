export type Profile = {
  id: string;
  full_name: string;
  role: 'customer' | 'driver' | 'admin';
  created_at: string;
  updated_at: string;
};

export type Parcel = {
  id: string;
  sender_id: string;
  receiver_id: string;
  driver_id: string | null;
  status: 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
  pickup_address: string;
  delivery_address: string;
  pickup_instructions?: string;
  delivery_instructions?: string;
  created_at: string;
  updated_at: string;
};

export type ParcelTracking = {
  id: string;
  parcel_id: string;
  status: string;
  location?: string;
  notes?: string;
  created_at: string;
};

export interface Partner {
  id: string;
  location: string;
  latitude: number;
  longitude: number;
  profile: {
    full_name: string;
  }[];
  address?: string;
  working_hours?: string;
  location_pic_url?: string;
  gallery_urls?: string[];
  contact_person?: string;
  contact_phone?: string;
  accepts_cash?: boolean;
  accepts_card?: boolean;
  allows_payment_processing?: boolean;
  allows_proxy_payment?: boolean;
  payment_methods?: string[];
} 