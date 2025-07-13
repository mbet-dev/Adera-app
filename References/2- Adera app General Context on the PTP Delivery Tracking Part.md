Adera – app Context : 

Here's a crystal-clear, comprehensive, and structured context definition and development roadmap for modern, full-fledged, elegant, and robust parcel delivery and tracking app, Adera, tailored specifically for its launch and use in Addis Ababa, Ethiopia.

🧠 Project Context: Adera Delivery & Tracking Platform
🌍 Purpose:
To revolutionize urban delivery in Addis Ababa with a user-friendly, real-time parcel tracking and delivery service that is secure, affordable, multilingual, and mobile-first, with role-based access and strong local integrations.

🔧 Tech Stack (Free/Open Source & Locally Compatible)
Layer	Stack
Frontend (Web + Mobile)	React Native with Expo (for iOS, Android, and Web)
Backend	Supabase (auth, storage, database, real-time capabilities)
Maps	OpenStreetMap (Web), react-native-maps + Mapbox or Leaflet for Native
Notifications	Expo Push Notifications (mobile), Supabase real-time + FCM
In-app Chat	Supabase Realtime (with Role-based message rooms)
Payments	Cash on Delivery, Telebirr, Chapa, ArifPay (via SDKs/APIs)
Languages	i18n via react-i18next or expo-localization
QR Code Generation & Scanning	react-native-qrcode-svg, expo-barcode-scanner
Authentication	Supabase Auth (email/password, OTP, third-party providers as needed)

👤 Role Definitions & Core Functionalities
1. Customer (eg.Abel… being the sender)
    • Create Delivery Orders
    • Choose Pickup/Drop-off Points
    • Real-Time Tracking
    • In-App Wallet & Payments
    • In-App and Push Notifications
    • Parcel History
    • Chat with Support/Courier
    • Takes pictures of parcel to be uploaded (max.3) … for visual cross-checking against wrong parcel to be dropped off
2. Customer (eg.Beza … being the Recipient)
    • Track Incoming Parcel
    • Confirm Delivery via Unique Code or QR
    • Chat with Sender or Support
    • Push/In-App Notifications
    • Takes pictures of parcel to be uploaded (max.3) … in case of complaint against wrongly handled/damaged parcel
3. Partner (Drop-off/Pick-up Point)
    • View Assigned Deliveries
    • Scan QR Codes for Check-in/Out
    • Verify Recipients with Pickup Codes
    • Update Parcel Status (Scanned/Received/Rejected)
    • Notification System (New Arrivals, Verification Needed)
    • 
4. Courier (Driver/Transporter)
    • View Daily Assigned Jobs
    • Real-Time Parcel Location Updates
    • Scan Parcels at Pickup/Dropoff
    • Navigation Support
    • In-App Chat with Customers & Staff
    • Delivery Confirmation with Timestamp
    • Bulk scan functionality for parcels
    • Fuel and expense tracking
    • Takes pictures of parcel to be uploaded (max.3) … in case of complaint against wrongly handled/damaged parcel or visual cross-checking against wrong parcel to pick up
    •  **Location Tracking:** GPS updates every 5 mins (stored in `parcel_events` table).  
    • 
5. Personnel (Sorting Facility Staff)
    • Scan & Verify Parcels at Facility
    • Assign Couriers for Outgoing Shipments
    • Update Sorting Status
    • Log Issues or Irregularities
    • Takes pictures of parcel to be uploaded (max.3) … in case of complaint against wrongly handled/damaged parcel or visual cross-checking against wrong parcel to pick up
6. Admin
    • Dashboard: View Overall Statistics
    • Manage Users & Roles
    • Partner Management
    • Payment Reconciliation
    • App Configuration & Support Chat Moderation
    • View Logs, Parcel Histories, and Disputes
    • Real-time KPIs (delivery volume, payment statuses, user reports & complaints).
    • (Access chat logs, parcel history, manual status overrides.)
    •   


🌐 Multilingual Requirements
Use react-i18next or expo-localization with language JSON files for:
    • English (default)
    • Amharic (አማርኛ)
    • Afaan Oromoo (Oromiffa)
    • Tigrigna (ትግርኛ)
    • Somali (Af Soomaali)
Switch language based on system preference or manual selection from a language menu.


:      Role Interfaces 
    1. Customer-facing delivery creation flow
    2. Partner scanning dashboard
    3. Courier navigation interface
    4. Admin analytics portal



🧾 Delivery Flow – End-to-End Lifecycle
1. Order Creation – Abel (Customer)
    • Authenticates
    • Starts new delivery
    • Accepts terms (T&C + Prohibited Items modal)
    • Selects package type and details
    • Chooses pickup location via map (OpenStreetMap)
    • Selects nearest/preferred drop-off point (Partner)
    • Chooses payment option (Telebirr/Wallet/Cash/Recipient-pays)
    • Confirms and gets QR + Tracking Code
    • Gets Push Notification
2. System Handling
    • Parcel entry saved in Supabase DB
    • Triggers real-time notifications (Courier, Partner, Beza)
    • Generates unique tracking ID, Pickup Code, and QR Code
    • Maps all future scans to statuses
3. Drop-off Phase – Partner
    • Scans QR (check-in)
    • Verifies sender
    • View inventories
    • View earnings (from commission)
    • System: Updates status: "At Dropoff Point"
    • System: Push notification to Courier and Sorting Center
4. Transit – Courier
    • Picks up package
    • Scans QR (logs timestamp + location)
    • System: Status: "In Transit to Facility"
5. Sorting Facility – Personnel
    • Receives parcel
    • Scans QR for intake
    • Assigns new courier to a number of Pickup points
    • System: Generates Pickup Code for Beza
    • System: Status: "Sorted & Ready for Delivery"
6. Delivery – Courier to Pickup Point
    • Transports to final Partner location
    • System: QR scan confirms arrival
    • System: Push notification to Beza
    • System: Status: "Ready for Pickup"
7. Final Delivery – Beza (Recipient)
    • Receives notification
    • Enters code or scans QR at Partner
    • Verified + Digitally signs
    • System: Status: "Delivered"
    • Feedback & Rating screen appears

🔐 Security & Status Control
    • Role-based access control (RBAC) managed and RLS via Supabase policies
    • Parcel status flags: created, dropoff, facility_received, in_transit_to_facility_hub, in_transit_to_pickup_point/dispatched, pickup_ready, delivered
    • Every QR scan is tied to: timestamp, location, and user role
    • Conditional flows (e.g., pay-by-recipient requires recipient confirmation)
    • Biometrics option for the sensitive activities with the frontend


🛠️ Development Roadmap
Phase 1: Planning & Setup
    • Define schema & Supabase roles
    • Setup Supabase (DB, Auth, Storage, Policies)
    • Setup Expo + Monorepo for Mobile/Web
    • Define UI/UX for each role
Phase 2: Core MVP Features
    • Auth Flow (login, signup, roles)
    • Customer Flow (Create delivery, payments, status)
    • Partner Portal (Drop-off scans, verification)
    • Courier Interface (Pickup routes, parcel handling)
    • Basic Admin Dashboard (Supabase or lightweight frontend)
Phase 3: Communication & Localization
    • Implement multilingual system
    • Real-time in-app chat (per order or user)
    • Push notification system (Expo + FCM)
    • SMS fallback for delivery confirmations
Phase 4: Payment Gateway Integrations
    • Add Cash on Delivery logic
    • Integrate:
        ◦ ✅ Telebirr (via Ethio Telecom API)
        ◦ ✅ Chapa or ArifPay (based on SDK docs)
    • Implement wallet system (deposit, pay, refund if order canceled)
Phase 5: Polishing & Launch
    • Thorough testing (Unit, E2E with Detox)
    • UI polishing for responsiveness
    • Launch Beta (internal team, invited partners)
    • Public rollout (Addis-wide)

📦 Database Schema Highlights (Supabase)
Tables:
    • users: profile, role, language
    • parcels: id, sender_id, recipient_info, pics, tracking_code, pickup_code, flag, status, timestamps
    • transactions: id, parcel_id, amount, payment_type, status
    • partners: id, location, loc_pic, working_hours
    • couriers: id, assigned_parcels, pics_upload
    • messages: from_id, to_id, parcel_id, message, timestamp
    • notifications: user_id, message, type, read_status
    • events_log: action_type, actor_role, time, parcel_id, meta
    • parcel_events`:   `parcel_id`, `status`, `actor_id` (user who scanned), `location`, `timestamp`.  


🔗 Integrations
Feature	Tech
QR Code	react-native-qrcode-svg, expo-barcode-scanner
Map Display	react-native-maps, OpenStreetMap tiles
Real-time DB	Supabase Realtime Channels
Multilingual	react-i18next, expo-localization
Push Notifications	expo-notifications, Firebase Cloud Messaging (FCM)
Chat	Supabase + Realtime Channels
Payments	Telebirr API, Chapa/ArifPay SDKs





*** Role-Based System Design

Each role has dedicated screens, permissions, and workflows:

#* Customer
- **Primary Use Cases**: Create deliveries, track parcels, manage wallet
- **Key Features**:
  - **Parcel Creation Wizard**: 
    - Terms/Prohibited Items modal
    - Package size/type dropdowns (document, small, medium, large)
    - Map-based Partner selection (OpenStreetMap markers with distance ranking)
    - Dynamic pricing calculator (distance + size)
  - **Payment Options**:
    - Telebirr/Chapa integration via API/Webview
    - COD toggle (requires recipient confirmation)
    - In-app wallet (balance visible on dashboard)
  - **Tracking Dashboard**:
    - Live map with parcel route
    - Timeline view of status updates (created → at dropoff → in transit → delivered)
    - Digital signature capture upon delivery

#* Partner (Pickup/Dropoff Points)
- **Primary Use Cases**: Scan parcels, manage inventory, view earnings
- **Key Features**:
  - **QR Scanner**: 
    - Validate parcel eligibility via QR fusion code
    - Update parcel status (received/dropped off)
  - **Inventory Management**:
    - List of pending parcels with pickup codes
    - Filter by status/time
  - **Earnings Dashboard**:
    - Commission tracking per parcel
    - Withdrawal history (linked to Telebirr/Chapa)

##* Courier
- **Primary Use Cases**: Route optimization, parcel handover, status updates
- **Key Features**:
  - **Route Planner**:
    - Turn-by-turn navigation via OpenStreetMap
    - Batched parcel routes (sorted by proximity)
  - **Parcel Handover**:
    - Scan QR to update status (picked up from Partner → en route to Hub)
    - Photo capture for damage reports
  - **Earnings Tracker**:
    - Per-parcel commission
    - Performance metrics (deliveries/day)

#* Sorting Facility Personnel
- **Primary Use Cases**: Sort parcels, assign couriers, resolve disputes
- **Key Features**:
  - **Sorting Interface**:
    - Bulk QR scanning for incoming parcels
    - Drag-and-drop assignment to couriers
  - **Dispute Resolution**:
    - View parcel history + media (damage reports)
    - Admin chat for escalation
  - **Analytics Dashboard**:
    - Daily throughput
    - Delayed parcel alerts

#* Admin
- **Primary Use Cases**: Monitor operations, manage users, configure settings
- **Key Features**:
  - **Operations Dashboard**:
    - Real-time map of all parcels
    - Fraud detection (duplicate QR scans)
  - **User Management**:
    - Approve Partners
    - Ban fraudulent users
  - **Revenue Analytics**:
    - Profit margins per route
    - Payment method distribution

---

#* Key Technical Features
#* Multilingual Support
- **Implementation**:
  - `i18n-js` library with JSON translation files
  - Language switcher in profile settings (default: English)
  - RTL support for Amharic (limited, as Amharic script is LTR)
- **UI Adaptations**:
  - Dynamic font scaling for Amharic/Tigrinya
  - Locale-aware date/time formatting

#* QR Code System
- **Structure**:
  - `QR_CODE = TRACKING_ID + PHASE_FLAG + TIMESTAMP + HASH`
- Example: `ADE20231001-2-1672531005-7c6d3a`

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

##### **Notifications**
- **Channels**:
  - **Push**: Expo + Supabase Realtime (for active users)
  - **SMS**: Twilio or local gateway (EthioTel) for critical alerts
  - **In-App**: Persistent banner for unread notifications
- **Status Triggers**:
  - Parcel creation, phase updates, payment confirmations
  - Recipient verification code delivery

##### **Payment Flow**
- **COD Workflow**:
  - Sender selects COD → Recipient gets confirmation request (24-hour expiry)
  - If declined → Parcel auto-canceled, Partner notified
- **Gateway Integration**:
  - Telebirr: Mobile PIN-based OTP flow
  - Chapa: Embedded Webview with transaction receipt

---

==> For error resolution and better development, Refer to the documentations provided by the tech stacks used here, such as :

expo : https://docs.expo.dev/
react-native : https://reactnative.dev/docs/getting-started
Yenepay : https://github.com/yenepay
TeleBirr : https://developer.ethiotelecom.et/docs/GettingStarted
Chapa Payment Integration : https://developer.chapa.co/
Supabase : https://supabase.com/docs
Openstreetmap : https://wiki.openstreetmap.org/wiki/Develop
GitHub : https://docs.github.com/

