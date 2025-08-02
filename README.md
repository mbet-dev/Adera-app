# 🚀 Adera App

<div align="center">

![Adera Logo](https://img.shields.io/badge/Adera-Platform-blue?style=for-the-badge&logo=react)
![Version](https://img.shields.io/badge/Version-1.0.0-green?style=for-the-badge)
![Platform](https://img.shields.io/badge/Platform-React%20Native%20%7C%20Expo-orange?style=for-the-badge)

*A comprehensive dual-purpose platform combining PTP Parcel Delivery & E-Commerce for Addis Ababa, Ethiopia*

[![Features](https://img.shields.io/badge/Features-Parcel%20Delivery%20%7C%20E--Commerce%20%7C%20Payment%20Integration-lightgrey?style=for-the-badge)](https://github.com/mbet-dev/Adera-app)
[![Tech Stack](https://img.shields.io/badge/Tech%20Stack-React%20Native%20%7C%20TypeScript%20%7C%20Supabase%20%7C%20Expo-blue?style=for-the-badge)](https://github.com/mbet-dev/Adera-app)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Development](#-development)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**Adera** is a revolutionary dual-purpose platform designed specifically for Addis Ababa, Ethiopia, that seamlessly combines:

- **📦 Peer-to-Peer Parcel Delivery System** - Real-time tracking with QR codes
- **🛍️ E-Commerce Subsystem** - Partner shops with integrated payment solutions
- **🚚 Driver Management** - Route optimization and performance tracking
- **💳 Payment Integration** - Multiple Ethiopian payment gateways

### 🎯 Mission
To revolutionize logistics and e-commerce in Ethiopia by providing a unified platform that connects customers, partners, drivers, and businesses through innovative technology solutions.

---

## ✨ Key Features

### 🔐 Authentication & Security
- **Role-based authentication** (Customer, Partner, Driver, Staff, Admin)
- **Supabase Auth integration** with secure token management
- **Biometric authentication** support
- **Multi-language support** (i18next)

### 📦 Parcel Management
- **Multi-step parcel creation wizard**
- **Real-time tracking** with QR codes
- **Status-based delivery flow**
- **Photo evidence upload**
- **Route optimization**

### 🏪 Partner System
- **Partner registration and approval**
- **QR code scanning interface**
- **Earnings tracking**
- **E-commerce store setup**
- **Product management**

### 🚚 Driver System
- **Route optimization**
- **Real-time location tracking**
- **Parcel scanning and status updates**
- **Performance metrics**
- **Earnings dashboard**

### 🛒 E-commerce Integration
- **Partner store templates**
- **Product management**
- **Order processing**
- **Commission tracking**
- **Inventory management**

### 💳 Payment Integration
- **Telebirr mobile money**
- **Chapa payment gateway**
- **ArifPay integration**
- **Cash on delivery support**

---

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile App    │    │   Web App       │    │   Admin Panel   │
│   (React Native)│    │   (React Web)   │    │   (React Web)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Supabase      │
                    │   (Backend)     │
                    │   - Database    │
                    │   - Auth        │
                    │   - Storage     │
                    │   - Functions   │
                    └─────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Payment       │    │   SMS Service   │    │   Map Service   │
│   Gateways      │    │   (Notifications)│   │   (Location)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
- **React Native** (0.79.5) - Cross-platform mobile development
- **Expo** (53.0.20) - Development platform and tools
- **TypeScript** - Type safety and better development experience
- **React Navigation** - Navigation between screens
- **React Hook Form** - Form handling and validation

### Backend & Database
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Real-time subscriptions
  - Authentication
  - Storage
  - Edge Functions

### State Management
- **Zustand** - Lightweight state management
- **React Query** - Server state management
- **AsyncStorage** - Local data persistence

### UI/UX
- **React Native Vector Icons** - Icon library
- **Expo Linear Gradient** - Gradient components
- **React Native Maps** - Map integration
- **React Native Safe Area Context** - Safe area handling

### Payment & Services
- **Telebirr API** - Ethiopian mobile money
- **Chapa API** - Payment gateway
- **ArifPay API** - Payment processing
- **SMS Service** - Notifications

### Development Tools
- **Expo CLI** - Development and build tools
- **TypeScript** - Type checking
- **ESLint** - Code linting
- **Prettier** - Code formatting

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **Expo CLI** (`npm install -g @expo/cli`)
- **Supabase account**
- **Payment gateway accounts** (Telebirr, Chapa, ArifPay)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mbet-dev/Adera-app.git
   cd Adera-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
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

4. **Start Development**
   ```bash
   # Start Expo development server
   npm start

   # Run on specific platform
   npm run android
   npm run ios
   npm run web
   ```

---

## 📁 Project Structure

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

---

## 💻 Development

### Available Scripts
```bash
npm start              # Start Expo development server
npm run android        # Run on Android
npm run ios           # Run on iOS
npm run web           # Run on web
npm run build:web     # Build for web
npm run serve:web     # Serve web build
```

### Code Style Guidelines
- Use **TypeScript** for type safety
- Follow **React Native** best practices
- Use **functional components** with hooks
- Implement proper **error handling**
- Follow **consistent naming conventions**

### State Management
- **Zustand** for global state
- **React Query** for server state
- **Local state** for component-specific data

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Write **clean, readable code**
- Add **appropriate tests**
- Update **documentation** as needed
- Follow **TypeScript** best practices
- Ensure **cross-platform compatibility**

---

## 📄 License

This project is proprietary software. All rights reserved.

---

## 👨‍💻 Developer

**Developed by:** [Ermias Dejene](https://heylink.me/Ermax7) under/for MBet-Adera project - ©2025

---

<div align="center">

**Made with ❤️ for Ethiopia**

[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/mbet-dev/Adera-app)
[![Issues](https://img.shields.io/badge/Issues-Welcome-red?style=for-the-badge)](https://github.com/mbet-dev/Adera-app/issues)
[![Pull Requests](https://img.shields.io/badge/PRs-Welcome-green?style=for-the-badge)](https://github.com/mbet-dev/Adera-app/pulls)

</div> 