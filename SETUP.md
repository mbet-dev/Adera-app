# Adera App - Setup Guide

## Overview
Adera is a dual-purpose platform combining PTP (Peer-to-Peer) Parcel Delivery and Tracking System with an E-Commerce Subsystem for Partner Shops, specifically designed for Addis Ababa, Ethiopia.

## Prerequisites
- Node.js (v18 or higher)
- Expo CLI
- Supabase account
- Payment gateway accounts (Telebirr, Chapa, ArifPay)

## Quick Start

### 1. Clone and Install Dependencies
```bash
git clone <repository-url>
cd adera-app
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory with the following variables:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Map Configuration
EXPO_PUBLIC_MAPBOX_TOKEN=your_mapbox_token

# Payment Gateway Configuration
EXPO_PUBLIC_TELEBIRR_API_KEY=your_telebirr_api_key
EXPO_PUBLIC_CHAPA_API_KEY=your_chapa_api_key
EXPO_PUBLIC_ARIFPAY_API_KEY=your_arifpay_api_key

# SMS Service Configuration
EXPO_PUBLIC_SMS_API_KEY=your_sms_service_api_key
EXPO_PUBLIC_SMS_SENDER_ID=your_sms_sender_id

# App Configuration
EXPO_PUBLIC_APP_NAME=Adera
EXPO_PUBLIC_APP_VERSION=1.0.0
EXPO_PUBLIC_ENVIRONMENT=development
```

### 3. Database Setup
1. Create a new Supabase project
2. Run the database schema script in your Supabase SQL editor:
   ```sql
   -- Copy and paste the contents of database_schema.sql
   ```
3. Configure Row Level Security (RLS) policies
4. Set up authentication providers

### 4. Start Development
```bash
# Start Expo development server
npm start

# Run on specific platform
npm run android
npm run ios
npm run web
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI components (Button, Input, Card)
│   ├── forms/          # Form components
│   ├── maps/           # Map-related components
│   └── business/       # Business logic components
├── screens/            # Screen components
│   ├── auth/           # Authentication screens
│   ├── customer/       # Customer-specific screens
│   ├── partner/        # Partner-specific screens
│   ├── driver/         # Driver-specific screens
│   └── admin/          # Admin screens
├── navigation/         # Navigation configuration
├── store/              # State management (Zustand)
├── services/           # API and external services
├── hooks/              # Custom React hooks
├── contexts/           # React contexts
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── lib/                # Library configurations
└── map/                # Map-related utilities
```

## Key Features

### Authentication System
- Role-based authentication (Customer, Partner, Driver, Staff, Admin)
- Supabase Auth integration
- Secure token management

### Parcel Management
- Multi-step parcel creation wizard
- Real-time tracking with QR codes
- Status-based delivery flow
- Photo evidence upload

### Partner System
- Partner registration and approval
- QR code scanning interface
- Earnings tracking
- E-commerce store setup

### Driver System
- Route optimization
- Real-time location tracking
- Parcel scanning and status updates
- Performance metrics

### E-commerce Integration
- Partner store templates
- Product management
- Order processing
- Commission tracking

### Payment Integration
- Telebirr mobile money
- Chapa payment gateway
- ArifPay integration
- Cash on delivery support

## Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow React Native best practices
- Use functional components with hooks
- Implement proper error handling

### State Management
- Zustand for global state
- React Query for server state
- Local state for component-specific data

### UI/UX
- Consistent design system
- Responsive layouts
- Accessibility compliance
- Multilingual support

### Testing
- Unit tests for business logic
- Integration tests for API calls
- E2E tests for critical flows

## Deployment

### Mobile Apps
1. Configure app signing
2. Build for production
3. Submit to app stores

### Web App
1. Build for web
2. Deploy to hosting service
3. Configure domain and SSL

## Support

For questions and support:
- Check the documentation in `/memory-bank/`
- Review the database schema
- Consult the technical context

## License

This project is proprietary software. All rights reserved. 