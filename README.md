# Adera - Parcel Delivery & Tracking App

A modern parcel delivery and tracking platform designed specifically for Addis Ababa, Ethiopia.

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_TELEBIRR_API_KEY=your_telebirr_key
EXPO_PUBLIC_CHAPA_PUBLIC_KEY=your_chapa_key
```

3. Start the development server:
```bash
npm start
```

## Project Structure

```
src/
  ├── screens/          # Screen components
  │   ├── auth/        # Authentication screens
  │   └── main/        # Main app screens
  ├── components/       # Reusable components
  ├── navigation/       # Navigation configuration
  ├── services/        # API and external services
  ├── utils/           # Utility functions
  ├── hooks/           # Custom React hooks
  ├── constants/       # App constants
  ├── assets/          # Images, fonts, etc.
  ├── locales/         # Translation files
  └── map/            # Map-related components
```

## Features

- Real-time parcel tracking
- QR code-based parcel management
- Multi-language support
- Payment integration
- Push notifications
- Offline capabilities
- OpenStreetMap integration

## Tech Stack

- React Native with Expo
- TypeScript
- Supabase
- React Navigation
- OpenStreetMap (via WebView)
- Expo Notifications
- React i18next
