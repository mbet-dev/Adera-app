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
  profile_id?: string;
  location?: string;
  contact_person?: string;
  contact_phone?: string;
  payment_methods?: string[];
  has_pos_machine?: boolean;
  accepts_proxy_payment?: boolean;
  working_hours?: Record<string, string>;
  image_url?: string;
  image_urls?: string[];
  profile?: Profile[];
  created_at?: string;
  updated_at?: string;
  latitude?: number | string;
  longitude?: number | string;
} 