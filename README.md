# Adera - Parcel Delivery & Tracking App

A cross-platform mobile and web application for parcel delivery and tracking, built with React Native and Expo.

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   EXPO_PUBLIC_TELEBIRR_API_KEY=your_telebirr_key
   EXPO_PUBLIC_CHAPA_PUBLIC_KEY=your_chapa_key
   ```
4. Start the development server:
   ```bash
   npm start
   ```

## Features

- Role-based authentication (Customer, Driver, Admin)
- Real-time parcel tracking
- Push notifications
- Cross-platform (iOS, Android, Web)
- Secure data storage with Supabase
- Modern UI/UX design

## Tech Stack

- React Native
- Expo
- TypeScript
- Supabase
- React Navigation
- React Hook Form
- Yup

## Project Structure

```
src/
  ├── components/     # Reusable UI components
  ├── screens/        # Screen components
  ├── navigation/     # Navigation configuration
  ├── hooks/          # Custom React hooks
  ├── lib/           # Third-party library configurations
  ├── types/         # TypeScript type definitions
  └── utils/         # Utility functions
```

## Development

- `main` - Production-ready code
- `stable/v1.0.0` - Stable release branch
- `develop/v1.0.0` - Development branch

## Contributing

1. Create a feature branch from `develop/v1.0.0`
2. Make your changes
3. Submit a pull request

## License

MIT
