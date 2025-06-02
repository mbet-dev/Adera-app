# Technical Context

## Technology Stack

### Frontend (Mobile)
- React Native with Expo
- TypeScript
- React Navigation
- React Native WebView
- react-native-qrcode-svg
- expo-barcode-scanner
- react-i18next
- expo-localization
- expo-notifications
- expo-image-picker

### Frontend (Web)
- React 18+
- TypeScript
- React Router
- React Leaflet
- QRCode.react
- i18next
- Web Notifications API
- File Upload

### Shared
- TypeScript
- React Query
- Zustand (State Management)
- React Hook Form
- Yup (Validation)
- date-fns
- axios

### Backend (Supabase)
- PostgreSQL Database
- Supabase Auth
- Supabase Storage
- Supabase Realtime
- Row Level Security (RLS)
- Edge Functions

### Maps & Location
- OpenStreetMap
- Leaflet
- React Leaflet (Web)
- WebView with Leaflet (Mobile)
- GPS tracking
- Geocoding services

### Payment Integration
- **Telebirr API**
  - Mobile PIN-based OTP
  - Real-time verification
  - Transaction history
  - Refund processing
  - Documentation: https://developer.ethiotelecom.et/docs/GettingStarted

- **Chapa SDK**
  - Webview integration
  - Transaction tracking
  - Receipt generation
  - Refund handling
  - Documentation: https://developer.chapa.co/

- **ArifPay SDK**
  - Native SDK integration
  - Real-time verification
  - Transaction logging
  - Refund processing
  - Documentation: [ArifPay SDK Docs]

- **Cash on Delivery System**
  - Recipient verification
  - Digital signature
  - Photo evidence
  - Transaction logging
  - Status tracking

## Development Setup

### Prerequisites
- Node.js 18+
- Expo CLI
- Git
- VS Code
- Supabase CLI
- Android Studio / Xcode

### Environment Variables
```env
# Supabase
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Payment
EXPO_PUBLIC_TELEBIRR_API_KEY=your_telebirr_key
EXPO_PUBLIC_CHAPA_PUBLIC_KEY=your_chapa_key

# Platform
EXPO_PUBLIC_PLATFORM=web|mobile
```

## Dependencies

### Core Dependencies
```json
{
  "dependencies": {
    "expo": "^49.0.0",
    "react": "18.2.0",
    "react-native": "0.72.0",
    "@supabase/supabase-js": "^2.0.0",
    "react-native-webview": "^13.0.0",
    "react-native-qrcode-svg": "^6.3.0",
    "expo-barcode-scanner": "~12.5.0",
    "react-i18next": "^13.0.0",
    "expo-localization": "~14.3.0",
    "expo-notifications": "~0.20.0",
    "expo-image-picker": "~14.3.0",
    "zustand": "^4.0.0",
    "react-query": "^4.0.0",
    "react-hook-form": "^7.0.0",
    "yup": "^1.0.0",
    "date-fns": "^2.30.0",
    "axios": "^1.0.0"
  },
  "devDependencies": {
    "typescript": "^5.1.0",
    "@types/react": "~18.2.0",
    "@types/react-native": "~0.72.0",
    "jest": "^29.0.0",
    "detox": "^20.0.0"
  }
}
```

## Technical Constraints

### Performance
- App size < 50MB
- Cold start < 3s
- Map load time < 2s
- QR scan response < 1s
- Offline capability for basic features
- Web bundle size < 200KB

### Security
- JWT authentication
- Row Level Security
- Encrypted storage
- Secure payment processing
- Biometric authentication option
- HTTPS only

### Device Support
- Android 8.0+
- iOS 13+
- Minimum 2GB RAM
- GPS capability required
- Camera required
- Modern browsers (Chrome, Firefox, Safari, Edge)

### Network
- Offline-first architecture
- Background sync
- Efficient data caching
- Optimized image uploads
- Real-time updates via WebSocket
- Progressive Web App support 