# Adera App Project Brief

## Overview
Adera is a comprehensive parcel delivery management system that connects senders, receivers, partners (dropoff/pickup points), drivers, and staff through a mobile and web application.

## Core Requirements

### Delivery Creation Flow
1. Terms & Conditions Modal
   - Must show before parameter input
   - Deep link in Settings page for all roles
   - Link to eligible parcel items list

2. Multi-Section Modal Flow
   - Package Details (Document/Small/Medium/Big)
   - Recipient Details (Member/Non-member)
   - Dropoff Point Selection
   - Pickup Point Selection
   - Payment Method Selection
   - Confirmation Page

### Tracking System
- QR Code Structure: `TRACKING_ID + PHASE_FLAG + TIMESTAMP + HASH`
- Client-side initial QR generation
- Server-side hash regeneration at pickup point
- SMS verification system for receivers

### Payment Cases
1. Direct sender payment (wallet/bank)
2. Dropoff point proxy payment
3. Receiver payment (member)
4. Receiver bank payment (non-member)
5. Cash on delivery at pickup point

### Partner Integration
- Display all available partners
- Indicate supported payment methods
- Show POS/proxy payment capabilities
- Working hours and contact info

## Technical Stack
- React Native (Mobile)
- React (Web)
- Supabase (Backend)
- Expo (Cross-platform)

## Project Goals
1. Create a seamless parcel delivery experience in Addis Ababa
2. Provide real-time tracking and updates
3. Support multiple payment methods
4. Enable multilingual communication
5. Ensure secure and reliable delivery operations
6. Maintain consistent experience across platforms

## Success Criteria
- Successful delivery tracking system
- Efficient partner and courier management
- Reliable payment processing
- Positive user feedback
- High delivery success rate
- Low parcel loss/damage rate
- Consistent cross-platform experience 