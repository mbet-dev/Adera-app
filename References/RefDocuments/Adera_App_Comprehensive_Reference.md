# Adera App: Comprehensive Development Reference

This document provides a unified, detailed, and structured context for the Adera application, synthesizing all available project briefings and technical specifications. It is intended to be the single source of truth for the development team.

---

## 1. Executive Summary

**Adera** is a dual-purpose mobile and web platform designed for Addis Ababa, Ethiopia. It integrates a **Peer-to-Peer (PTP) Parcel Delivery System** with an **E-Commerce Subsystem**. The platform connects senders, recipients, drivers, partner shops (acting as micro-hubs), and administrators in a seamless, trackable logistics network. Its core innovation is empowering partner shops to open and manage their own mini e-commerce stores within the Adera app, creating a synergistic ecosystem of logistics and local commerce.

- **Mission:** To revolutionize urban delivery in Addis Ababa by providing a secure, affordable, multilingual, and mobile-first service that is optimized for local infrastructure and payment habits.
- **Core Pillars:** Logistics (PTP Delivery) & E-Commerce (Partner Shops).
- **Target Niche:** Urban dwellers, small to medium merchants, and online sellers needing reliable fulfillment.
- **Key Differentiator:** A hub-and-spoke model using local partners, combined with an integrated marketplace to drive demand for both services.

---

## 2. Business & Market Context

- **Operating Environment:** Addis Ababa, Ethiopia.
- **Challenges Addressed:** Low digital infrastructure, prevalence of cash-based transactions, local language needs, and a fragmented logistics market.
- **Solution:** A hybrid platform that leverages local partners as micro-hubs (drop-off/pickup points) and integrates local payment solutions (Telebirr, Chapa, ArifPay, Cash-on-Delivery).
- **Languages:** The UI/UX must be fully localized for **English (Default), Amharic, Afaan Oromoo, Tigrigna, and Somali**.

---

## 3. User Roles & Stakeholders

Adera is a role-based system. Each user type has a dedicated interface and specific permissions.

| Role | Description & Key Functions |
| :--- | :--- |
| **Customer (Sender/Recipient)** | The end-users of the delivery service. Senders create parcels, and recipients track and receive them. |
| **Partner (Shop/Hub)** | Local businesses (shops, minimarkets) that act as drop-off and pickup points. They can also open an e-shop. |
| **Driver (Courier)** | Transports parcels between partners and sorting facilities. |
| **Sorting Facility Staff** | Manages the central hub where parcels are sorted, rerouted, and assigned to drivers. |
| **Admin** | Oversees the entire platform, manages users, resolves disputes, and monitors analytics. |

---

## 4. Core Features & Functionalities

### 4.1. Logistics Platform

- **Dynamic Pricing:** Calculated based on distance, parcel weight/size, and urgency.
- **Real-Time Tracking:** Live map view of the parcel's journey for customers.
- **QR Code System:** Secure, verifiable handovers at every stage of the delivery lifecycle.
- **Route Optimization:** For drivers to ensure efficient and timely deliveries.
- **Dispute Resolution:** A dedicated UI for managing complaints, including media attachments and timelines.
- **Multilingual Support:** Full UI translation and locale-aware formatting.
- **Robust Notifications:** Push, SMS, and in-app notifications for all critical events.

### 4.2. E-Commerce Subsystem

- **Partner E-Shops:** Partners can create and manage a simple storefront within the Adera app.
- **Product Management:** Upload product images, set prices, define categories, and manage inventory.
- **Integrated Fulfillment:** Orders placed through an e-shop automatically create an Adera delivery order.
- **Promotional Tools:** Partners can run ads, limited-time offers, or flash sales.
- **Ratings & Reviews:** Customers can rate products and partner shops.

### 4.3. Analytics & Dashboards

- **Admin Dashboard:** KPIs on sales trends, partner performance, delivery heatmaps, and revenue.
- **Partner Dashboard:** View orders, store traffic, sales conversion rates, and total earnings.
- **Gamification:** Badges, bonuses, and performance tiers to incentivize drivers and partners.

---

## 5. Technical Architecture & Stack

| Layer | Technology / Stack |
| :--- | :--- |
| **Frontend (Mobile & Web)** | React Native with Expo |
| **Backend & Database** | Supabase (PostgreSQL, Auth, Storage, Realtime) |
| **Maps & Geolocation** | OpenStreetMap, `react-native-maps` |
| **Payments** | Telebirr, Chapa, ArifPay, In-App Wallet, Cash-on-Delivery |
| **Notifications** | Expo Push Notifications (via FCM), Supabase Realtime, SMS Gateway |
| **In-App Chat** | Supabase Realtime with role-based chat rooms |
| **QR Code Handling** | `react-native-qrcode-svg` (generation), `expo-barcode-scanner` (scanning) |
| **Localization** | `react-i18next` or `expo-localization` |

---

## 6. End-to-End Workflow: The Parcel Lifecycle

This details the complete journey of a parcel from sender to recipient.

1.  **Order Creation (Sender: Alex)**
    - Alex logs in, clicks "Send Parcel," and accepts T&Cs.
    - He fills in the recipient's (Beza) details, parcel info, and uploads optional photos.
    - He selects a Drop-off Partner (P1) and Pickup Partner (P2) from a map.
    - He chooses a payment method and pays.
    - **System:** A unique `TRACKING_ID` and QR code are generated. The parcel status is set to `created`. Notifications are sent.

2.  **Drop-off (at Partner P1)**
    - Alex takes the parcel to P1.
    - P1 scans the QR code to check the parcel in.
    - **System:** Status updates to `at_dropoff_point`. A driver (D1) is notified for pickup.

3.  **Transit to Hub (Driver D1)**
    - D1 arrives at P1 and scans the QR code to collect the parcel.
    - **System:** Status updates to `in_transit_to_hub`.

4.  **Sorting Facility (Staff S1)**
    - The parcel arrives at the central hub. Staff (S1) scans it for intake.
    - The parcel is sorted and assigned to a new driver (D2) for final delivery.
    - **System:** Status updates to `at_sorting_hub`.

5.  **Transit to Pickup Point (Driver D2)**
    - D2 scans the parcel to begin the final leg of the journey.
    - **System:** Status updates to `dispatched`.
    - D2 arrives at the Pickup Partner (P2) and scans the parcel to confirm drop-off.
    - **System:** Status updates to `ready_for_pickup`. A **secure pickup code** is generated and sent to the recipient (Beza) via SMS/in-app notification.

6.  **Final Delivery (Recipient: Beza)**
    - Beza receives a notification that her parcel is ready.
    - She goes to P2 and provides her unique pickup code.
    - P2 verifies the code, hands over the parcel, and marks the order as complete.
    - **System:** Status updates to `delivered`. Beza is prompted to rate the service.

---

## 7. Detailed Use Case Scenarios

### 7.1. QR Code System

The QR code is central to Adera's security and tracking.

- **Format:** `TRACKING_ID + PHASE_FLAG + TIMESTAMP + HASH`
- **Example:** `ADE20250803-2-1754231005-7c6d3a`
- **Phase Flags:**
  - `0`: Created
  - `1`: At Dropoff Partner
  - `2`: Courier Picked Up (to Hub)
  - `3`: At Sorting Hub
  - `4`: Courier Dispatched (to Pickup Partner)
  - `5`: At Pickup Partner
  - `6`: Delivered
- **Validation:** The backend verifies that phase transitions occur in the correct sequence. Each scan is logged with user role, timestamp, and location data.

### 7.2. Payment Scenarios

Adera supports multiple payment flows to accommodate local needs.

| Case | Scenario | Workflow |
| :--- | :--- | :--- |
| **1. Sender Pays Upfront** | Alex pays for the delivery during order creation using his wallet or a payment gateway. | This is the standard flow. The order is confirmed immediately upon successful payment. |
| **2. Sender Pays Cash at Drop-off** | Alex has cash and chooses a Drop-off Partner (P1) that accepts cash payments. | The order is created with a `pending_payment` status. Alex goes to P1, provides the tracking ID, and pays cash. P1 confirms the payment in the app, and the delivery process begins. |
| **3. Recipient Pays** | Alex waives the payment to Beza. | The order is created with a `pending_payment` status. Beza receives a notification with a payment link. The order is confirmed only after Beza completes the payment. The request expires in 24 hours if unpaid. |
| **4. Cash on Delivery (COD)** | Alex waives the payment to Beza, who will pay cash upon pickup. | Alex must select a Pickup Partner (P2) that offers COD service. The parcel is delivered to P2. Beza pays cash to P2, who then marks the payment as received. Only then is the final pickup code released to Beza. |

---

## 8. Risks & Mitigation Strategies

| Risk | Mitigation Strategy |
| :--- | :--- |
| **Low Initial Demand** | Offer referral bonuses and promotional credits for early adopters. |
| **Strong Competition** | Focus on underserved localities, the unique e-commerce integration, and superior partner relationships. |
| **Cash-Based Culture** | Implement a robust and flexible system for Cash-on-Delivery (COD), in-app wallets, and SMS-based fallbacks. |
| **Limited Tech Infrastructure** | Design for offline capabilities (e.g., offline QR code scanning that syncs later) and use SMS for critical notifications. |
| **Partner Churn** | Ensure a transparent and fair commission model, provide performance incentives, and build a strong community. |
| **Parcel Loss or Disputes** | Enforce QR scanning and optional photo uploads at every handover point. Use a secure, unique pickup code for final delivery. |

---

## 9. Development Roadmap & Future Growth

### Phased Rollout

1.  **Phase 1: MVP Build**
    - Core parcel creation, tracking, and delivery flow.
    - Essential dashboards for drivers and partners.
    - Foundational payment integrations and role-based authentication.
2.  **Phase 2: E-Commerce Expansion**
    - Partner e-shop setup (product uploads, inventory).
    - Customer UI for browsing and purchasing from partner shops.
    - Admin approval workflow for new store onboarding.
3.  **Phase 3: Ecosystem Growth**
    - Launch promotional and ad modules for partners.
    - Implement a customer loyalty program (wallet points).
    - Introduce store-specific coupons and discounts.

### Future Cases

- Expansion into B2B logistics and last-mile delivery services.
- Franchise the Adera micro-hub model to other regions.
- Offer a white-label version of the Adera logistics technology.
- Develop a public API for "delivery-as-a-service."

---

## 10. Key Resources & Documentation

For technical implementation, refer to the official documentation of the chosen technologies:

- **Expo:** [https://docs.expo.dev/](https://docs.expo.dev/)
- **React Native:** [https://reactnative.dev/docs/getting-started](https://reactnative.dev/docs/getting-started)
- **Supabase:** [https://supabase.com/docs](https://supabase.com/docs)
- **Chapa:** [https://developer.chapa.co/](https://developer.chapa.co/)
- **Telebirr:** [https://developer.ethiotelecom.et/](https://developer.ethiotelecom.et/)
- **OpenStreetMap:** [https://wiki.openstreetmap.org/wiki/Develop](https://wiki.openstreetmap.org/wiki/Develop)
