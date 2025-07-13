# Adera App - System Patterns

## Architecture Overview

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile App    │    │   Web App       │    │   Admin Panel   │
│   (React Native)│    │   (React)       │    │   (React)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Supabase      │
                    │   (Backend)     │
                    └─────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Payment APIs  │    │   SMS Service   │    │   Map Services  │
│   (Telebirr,    │    │   (Twilio)      │    │   (OpenStreet)  │
│    Chapa)       │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Design Patterns

### 1. Role-Based Access Control (RBAC)
```typescript
enum UserRole {
  CUSTOMER = 'customer',
  PARTNER = 'partner',
  DRIVER = 'driver',
  STAFF = 'staff',
  ADMIN = 'admin'
}

interface User {
  id: string;
  role: UserRole;
  permissions: Permission[];
}
```

### 2. State Management Pattern
```typescript
// Zustand Store Structure
interface AppState {
  // User state
  user: User | null;
  isAuthenticated: boolean;
  
  // Parcel state
  parcels: Parcel[];
  activeParcel: Parcel | null;
  
  // UI state
  loading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User) => void;
  setParcels: (parcels: Parcel[]) => void;
  // ... other actions
}
```

### 3. Service Layer Pattern
```typescript
// Service interfaces
interface ParcelService {
  createParcel(data: CreateParcelData): Promise<Parcel>;
  trackParcel(trackingId: string): Promise<ParcelStatus>;
  updateStatus(parcelId: string, status: ParcelStatus): Promise<void>;
}

interface PaymentService {
  processPayment(data: PaymentData): Promise<PaymentResult>;
  verifyPayment(paymentId: string): Promise<PaymentStatus>;
}
```

### 4. Repository Pattern
```typescript
// Data access layer
interface ParcelRepository {
  findById(id: string): Promise<Parcel | null>;
  findByTrackingId(trackingId: string): Promise<Parcel | null>;
  create(data: CreateParcelData): Promise<Parcel>;
  update(id: string, data: Partial<Parcel>): Promise<Parcel>;
}
```

## Component Architecture

### 1. Screen Components
```
screens/
├── auth/
│   ├── LoginScreen.tsx
│   ├── RegisterScreen.tsx
│   └── ForgotPasswordScreen.tsx
├── customer/
│   ├── DashboardScreen.tsx
│   ├── CreateParcelScreen.tsx
│   ├── TrackParcelScreen.tsx
│   └── ProfileScreen.tsx
├── partner/
│   ├── PartnerDashboardScreen.tsx
│   ├── ScanParcelScreen.tsx
│   ├── InventoryScreen.tsx
│   └── EarningsScreen.tsx
├── driver/
│   ├── DriverDashboardScreen.tsx
│   ├── RouteScreen.tsx
│   └── ScanParcelScreen.tsx
└── admin/
    ├── AdminDashboardScreen.tsx
    ├── UserManagementScreen.tsx
    └── AnalyticsScreen.tsx
```

### 2. Reusable Components
```
components/
├── ui/
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   └── Modal.tsx
├── forms/
│   ├── ParcelForm.tsx
│   ├── PaymentForm.tsx
│   └── PartnerRegistrationForm.tsx
├── maps/
│   ├── MapView.tsx
│   ├── LocationPicker.tsx
│   └── RouteDisplay.tsx
└── business/
    ├── ParcelCard.tsx
    ├── StatusTimeline.tsx
    ├── QRScanner.tsx
    └── PaymentMethods.tsx
```

## Data Flow Patterns

### 1. Parcel Creation Flow
```
User Input → Form Validation → API Call → Database → Real-time Update → UI Update
```

### 2. Real-time Tracking Flow
```
Database Change → Supabase Realtime → Client Subscription → State Update → UI Re-render
```

### 3. Payment Processing Flow
```
Payment Request → Payment Gateway → Webhook → Database Update → Notification → UI Update
```

## Security Patterns

### 1. Row Level Security (RLS)
```sql
-- Example RLS policy for parcels
CREATE POLICY "Users can view their own parcels" ON parcels
FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
```

### 2. Authentication Flow
```
Login → JWT Token → Secure Storage → API Calls → Token Refresh → Logout
```

### 3. Data Validation
```typescript
// Input validation schema
const parcelSchema = yup.object({
  recipientName: yup.string().required(),
  recipientPhone: yup.string().matches(/^\+251\d{9}$/),
  packageType: yup.string().oneOf(['document', 'small', 'medium', 'large']),
  pickupLocation: yup.object({
    latitude: yup.number().required(),
    longitude: yup.number().required()
  })
});
```

## Error Handling Patterns

### 1. Global Error Boundary
```typescript
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to monitoring service
    // Show user-friendly error message
  }
}
```

### 2. API Error Handling
```typescript
const handleApiError = (error: ApiError) => {
  switch (error.code) {
    case 'NETWORK_ERROR':
      return 'Please check your internet connection';
    case 'UNAUTHORIZED':
      return 'Please log in again';
    default:
      return 'Something went wrong. Please try again.';
  }
};
```

## Performance Patterns

### 1. Lazy Loading
```typescript
// Lazy load screens
const CreateParcelScreen = lazy(() => import('./CreateParcelScreen'));
const TrackParcelScreen = lazy(() => import('./TrackParcelScreen'));
```

### 2. Caching Strategy
```typescript
// React Query caching
const { data: parcels } = useQuery({
  queryKey: ['parcels', userId],
  queryFn: () => parcelService.getUserParcels(userId),
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
});
```

### 3. Image Optimization
```typescript
// Progressive image loading
const OptimizedImage = ({ uri, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  return (
    <Image
      source={{ uri }}
      onLoad={() => setIsLoaded(true)}
      style={[props.style, { opacity: isLoaded ? 1 : 0.3 }]}
      {...props}
    />
  );
};
```

## Testing Patterns

### 1. Component Testing
```typescript
describe('ParcelCard', () => {
  it('should display parcel information correctly', () => {
    render(<ParcelCard parcel={mockParcel} />);
    expect(screen.getByText(mockParcel.trackingId)).toBeInTheDocument();
  });
});
```

### 2. Integration Testing
```typescript
describe('Parcel Creation Flow', () => {
  it('should create parcel successfully', async () => {
    // Test complete flow from form to database
  });
});
```

### 3. E2E Testing
```typescript
describe('Customer Journey', () => {
  it('should complete parcel delivery process', async () => {
    // Test complete user journey
  });
});
``` 