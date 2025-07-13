# Adera App - Technical Context

## Technology Stack

### Frontend
- **React Native with Expo**: Cross-platform mobile development
- **React Navigation**: Navigation between screens
- **React Hook Form**: Form handling and validation
- **Yup**: Schema validation
- **Zustand**: State management
- **React Query**: Server state management and caching

### Backend & Database
- **Supabase**: Backend-as-a-Service
  - PostgreSQL database
  - Real-time subscriptions
  - Row Level Security (RLS)
  - Authentication
  - Storage for images
- **Supabase JS Client**: API integration

### Maps & Location
- **React Native Maps**: Native map components
- **OpenStreetMap**: Free map tiles and data
- **Leaflet**: Web map implementation
- **Expo Location**: GPS and location services

### Authentication & Security
- **Supabase Auth**: User authentication
- **Expo Secure Store**: Secure storage
- **Expo Local Authentication**: Biometric authentication
- **JWT Tokens**: Session management

### Payments
- **Telebirr**: Ethiopian Telecom mobile money
- **Chapa**: Payment gateway
- **ArifPay**: Alternative payment processor
- **Cash on Delivery**: Traditional payment method

### Notifications
- **Expo Notifications**: Push notifications
- **Supabase Realtime**: In-app notifications
- **SMS Integration**: Fallback notifications

### Internationalization
- **i18next**: Internationalization framework
- **react-i18next**: React integration
- **expo-localization**: Device locale detection

### QR Codes & Scanning
- **react-native-qrcode-svg**: QR code generation
- **expo-barcode-scanner**: QR code scanning

### Development Tools
- **TypeScript**: Type safety
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Expo CLI**: Development workflow

## Development Setup

### Prerequisites
- Node.js (v18+)
- Expo CLI
- Android Studio / Xcode
- Supabase account
- Payment gateway accounts

### Environment Variables
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
EXPO_PUBLIC_TELEBIRR_API_KEY=your_telebirr_key
EXPO_PUBLIC_CHAPA_API_KEY=your_chapa_key
```

### Project Structure
```
src/
├── components/     # Reusable UI components
├── screens/        # Screen components
├── navigation/     # Navigation configuration
├── services/       # API and external services
├── hooks/          # Custom React hooks
├── contexts/       # React contexts
├── store/          # State management
├── utils/          # Utility functions
├── types/          # TypeScript type definitions
├── lib/            # Library configurations
└── map/            # Map-related components
```

## Technical Constraints

### Performance
- **Bundle Size**: Keep app size under 50MB
- **Loading Times**: Sub-3 second initial load
- **Offline Support**: Critical functions work offline
- **Memory Usage**: Optimize for low-end devices

### Security
- **Data Encryption**: All sensitive data encrypted
- **API Security**: Rate limiting and input validation
- **Payment Security**: PCI compliance for payment processing
- **User Privacy**: GDPR-compliant data handling

### Scalability
- **Database Design**: Optimized for high read/write operations
- **Caching Strategy**: Implement intelligent caching
- **CDN Usage**: Optimize asset delivery
- **Microservices Ready**: Architecture supports future scaling

### Compatibility
- **Android**: API level 21+ (Android 5.0+)
- **iOS**: iOS 12.0+
- **Web**: Modern browsers (Chrome, Firefox, Safari, Edge)
- **Network**: Works on 2G connections with fallbacks

## Integration Points

### External APIs
- **Payment Gateways**: Telebirr, Chapa, ArifPay
- **SMS Services**: Twilio or local Ethiopian providers
- **Maps**: OpenStreetMap, Mapbox
- **Push Notifications**: Expo Push, Firebase Cloud Messaging

### Third-Party Services
- **Analytics**: Firebase Analytics or Supabase Analytics
- **Crash Reporting**: Sentry or Expo Crash Reporting
- **Monitoring**: Supabase Dashboard, Custom monitoring

## Development Workflow

### Code Quality
- **TypeScript**: Strict type checking
- **ESLint**: Code quality enforcement
- **Pre-commit Hooks**: Automated quality checks
- **Code Review**: Mandatory for all changes

### Testing Strategy
- **Unit Tests**: Jest for business logic
- **Integration Tests**: API and database interactions
- **E2E Tests**: Detox for critical user flows
- **Manual Testing**: Device-specific testing

### Deployment
- **Staging Environment**: Pre-production testing
- **Production Environment**: Live app deployment
- **Rollback Strategy**: Quick rollback capabilities
- **Monitoring**: Real-time performance monitoring 