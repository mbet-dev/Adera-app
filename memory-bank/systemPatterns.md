# System Patterns

## Architecture Overview

### Cross-Platform Architecture
- Shared business logic
- Platform-specific UI components
- Unified state management
- Common API layer
- Shared type definitions
- Platform detection utilities

### Mobile App Architecture
- Expo-based React Native
- Component-based architecture
- Navigation stack management
- State management with Zustand
- Custom hooks for shared logic
- Service layer for API communication

### Web App Architecture
- React with TypeScript
- Component-based architecture
- React Router for navigation
- State management with Zustand
- Custom hooks for shared logic
- Service layer for API communication

### Backend Architecture (Supabase)
- PostgreSQL database
- Row Level Security (RLS)
- Real-time subscriptions
- Edge Functions
- Storage buckets
- Authentication system

## Design Patterns

### Frontend Patterns
- Platform-specific components
- Shared business logic
- Custom hooks for platform detection
- Service layer pattern
- Repository pattern for data access
- Factory pattern for QR codes
- Strategy pattern for platform-specific features

### Backend Patterns
- Row Level Security policies
- Real-time subscription patterns
- Event-driven architecture
- Repository pattern
- Factory pattern for QR codes
- Strategy pattern for payment processing

### QR Code System
- **Structure Format**:
  ```
  QR_CODE = TRACKING_ID + PHASE_FLAG + TIMESTAMP + HASH
  Example: ADE20231001-2-1672531005-7c6d3a
  ```
- **Phase Flags**:
  - 0: Created
  - 1: At Dropoff Partner
  - 2: Courier Picked Up (to Hub)/in_transit_to_hub
  - 3: At Sorting Hub
  - 4: Courier Picked Up (to Recipient)/dispatched
  - 5: At Pickup Partner
  - 6: Delivered
- **Validation Logic**:
  - Partners/Couriers scan QR → Backend verifies phase progression
  - Each scan tied to timestamp, location, and user role
  - Phase transitions must follow valid sequence

## Component Structure

### Shared Components
- Authentication forms
- QR code scanner/generator
- Map components
- Chat interface
- Payment forms
- Loading states
- Error boundaries

### Mobile-Specific Components
- Native navigation
- Camera integration
- Push notifications
- Location services
- Biometric authentication

### Web-Specific Components
- Browser notifications
- File upload
- Progressive Web App
- Browser storage
- Service workers

## State Management

### Global State
- User authentication
- Language preferences
- Theme settings
- Navigation state
- Error handling
- Platform detection

### Local State
- Form state
- Parcel tracking
- Map state
- Chat state
- Payment state
- Platform-specific features

## Data Flow

### Frontend Data Flow
- Supabase queries
- Real-time subscriptions
- State updates
- Cache management
- Error handling
- Platform-specific data handling

### Backend Data Flow
- RLS policies
- Real-time events
- Database triggers
- Edge functions
- Storage operations
- Payment processing

## Security Patterns

### Authentication
- Supabase Auth
- JWT tokens
- Biometric authentication
- Session management
- Role-based access
- Platform-specific security

### Authorization
- Row Level Security
- Role-based permissions
- Resource protection
- API security
- Data encryption
- Platform-specific security

## Testing Strategy

### Frontend Testing
- Unit tests
- Integration tests
- E2E tests with Detox
- Performance tests
- Accessibility tests
- Cross-platform tests

### Backend Testing
- Database tests
- RLS policy tests
- Edge function tests
- Integration tests
- Security tests
- Payment integration tests

## Delivery Creation Flow

```mermaid
flowchart TD
    Start[FAB Press] --> TC[Terms & Conditions]
    TC -->|Accept| Step1[Package Details]
    TC -->|Reject| End

    Step1 --> Step2[Recipient Info]
    Step2 --> Step3[Dropoff Selection]
    Step3 --> Step4[Pickup Selection]
    Step4 --> Step5[Payment Method]
    Step5 --> Step6[Confirmation]
    
    Step6 -->|Confirm| Generate[Generate QR]
    Generate --> Store[Store Delivery]
    Store --> Notify[Notify Partners]
    
    Step6 -->|Cancel| End
```

## QR Code Lifecycle

```mermaid
flowchart TD
    Create[Create Delivery] --> GenQR[Generate Initial QR]
    GenQR --> Store[Store in Database]
    
    Store --> Track[Track Phase Changes]
    Track --> Pickup[Reach Pickup Point]
    
    Pickup --> NewHash[Generate New Hash]
    NewHash --> SendSMS[Send SMS to Receiver]
    SendSMS --> Verify[Verify at Delivery]
```

## Payment Flow Patterns

```mermaid
flowchart TD
    Start[Payment Selection] --> Case1[Direct Payment]
    Start --> Case2[Partner Payment]
    Start --> Case3[Receiver Payment]
    Start --> Case4[Bank Payment]
    Start --> Case5[Cash on Delivery]
    
    Case1 --> Wallet[Wallet]
    Case1 --> Bank[Bank]
    
    Case2 --> PartnerWallet[Partner Wallet]
    Case3 --> ReceiverWallet[Receiver Wallet]
    Case4 --> BankTransfer[Bank Transfer]
    Case5 --> CashAtPickup[Cash at Pickup]
```

## Component Architecture

```mermaid
flowchart TD
    FAB[Floating Action Button] --> Modal[Multi-Step Modal]
    
    Modal --> TC[Terms Modal]
    Modal --> Package[Package Form]
    Modal --> Recipient[Recipient Form]
    Modal --> Partners[Partner Selection]
    Modal --> Payment[Payment Selection]
    Modal --> Confirm[Confirmation]
    
    Partners --> Map[Map View]
    Partners --> List[List View]
    
    Payment --> Methods[Payment Methods]
    Payment --> Summary[Order Summary]
```

## State Management Pattern

```mermaid
flowchart LR
    Context[Delivery Context] --> State[Current State]
    Context --> Actions[Actions]
    
    State --> View[UI Components]
    Actions --> API[API Calls]
    
    API --> State
    View --> Actions
```

## Data Flow

```mermaid
flowchart TD
    Client[Client App] --> API[Supabase API]
    API --> DB[Database]
    
    DB --> Cache[Cache Layer]
    Cache --> Client
    
    API --> SMS[SMS Service]
    API --> Payment[Payment Gateway]
    API --> Notify[Notifications]
```

## Error Handling Pattern

```mermaid
flowchart TD
    Error[Error Occurs] --> Type[Determine Type]
    
    Type --> Network[Network Error]
    Type --> Validation[Validation Error]
    Type --> Auth[Auth Error]
    
    Network --> Retry[Retry Logic]
    Validation --> Form[Form Feedback]
    Auth --> Login[Re-auth Flow]
    
    Retry --> Success[Success]
    Form --> Fix[User Fix]
    Login --> Token[New Token]
``` 