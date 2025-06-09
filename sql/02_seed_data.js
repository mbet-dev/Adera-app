// Filename: sql/02_seed_data.js
// Description: Seeds the database with realistic sample data for all user roles.
//
// Instructions:
// 1. First, ensure you have successfully run the latest `sql/01_schema.sql` script.
// 2. Paste your SUPABASE_SERVICE_KEY into the placeholder below.
// 3. Open a terminal in the project root (`Adera-app/`).
// 4. Run the script: `node sql/02_seed_data.js`

import { createClient } from '@supabase/supabase-js';

// --- IMPORTANT: PASTE YOUR SERVICE KEY HERE ---
const SUPABASE_URL = 'https://homruajaunrqwdsmarnq.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvbXJ1YWphdW5ycXdkc21hcm5xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTQ5ODIzNSwiZXhwIjoyMDY1MDc0MjM1fQ.R2hNj67I29dty4gsJbbiLc0KWv1r1ZDcRC8yA9qM6Ds';
// ------------------------------------------

if (SUPABASE_SERVICE_KEY.includes('YOUR_SERVICE_ROLE_KEY')) {
  console.error('\nError: Please replace the placeholder for SUPABASE_SERVICE_KEY in the script.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const PASSWORD = 'mbet123';

const usersToSeed = [
  // --- Admin User (1) ---
  {
    email: 'admin@mbet.com',
    role: 'admin',
    fullName: 'Adera Admin',
    phone: '+251911000001'
  },
  // --- Staff Users (2) ---
  {
    email: 'staff1@mbet.com',
    role: 'staff',
    fullName: 'Tigist Alemu',
    phone: '+251911000002'
  },
  {
    email: 'staff2@mbet.com',
    role: 'staff',
    fullName: 'Yonas Getachew',
    phone: '+251911000003'
  },
  // --- Driver Users (3) ---
  {
    email: 'driver1@mbet.com',
    role: 'driver',
    fullName: 'Samuel Bekele',
    phone: '+251921000001',
    vehicleDetails: 'Toyota Vitz, Plate: A 45678 ET'
  },
  {
    email: 'driver2@mbet.com',
    role: 'driver',
    fullName: 'Hana Girma',
    phone: '+251921000002',
    vehicleDetails: 'Lifan Motorcycle, Plate: B 12345 ET'
  },
  {
    email: 'driver3@mbet.com',
    role: 'driver',
    fullName: 'Daniel Mesfin',
    phone: '+251921000003',
    vehicleDetails: 'Bajaj Qute, Plate: C 98765 ET'
  },
  // --- Customer Users (8) ---
  { email: 'customer1@gmail.com', role: 'customer', fullName: 'Abel Tesfaye', phone: '+251912345678' },
  { email: 'customer2@yahoo.com', role: 'customer', fullName: 'Beza Kebede', phone: '+251912345679' },
  { email: 'customer3@outlook.com', role: 'customer', fullName: 'Chernet Hailu', phone: '+251912345680' },
  { email: 'customer4@gmail.com', role: 'customer', fullName: 'Dawit Lemma', phone: '+251912345681' },
  { email: 'customer5@hotmail.com', role: 'customer', fullName: 'Eyerusalem Tadesse', phone: '+251912345682' },
  { email: 'customer6@gmail.com', role: 'customer', fullName: 'Fikadu Assefa', phone: '+251912345683' },
  { email: 'customer7@icloud.com', role: 'customer', fullName: 'Genet Moges', phone: '+251912345684' },
  { email: 'customer8@gmail.com', role: 'customer', fullName: 'Haben Girgis', phone: '+251912345685' },
  // --- Partner Users (20 Standard + 2 Facilities) ---
  // Sorting Facilities (2)
  {
    email: 'facility.akalikality@mbet.com',
    role: 'partner',
    fullName: 'Adera Sorting Facility - Akaki Kality',
    phone: '+251931000001',
    isFacility: true,
    location: 'Akaki Kality Industrial Park, Addis Ababa'
  },
  {
    email: 'facility.bolelemi@mbet.com',
    role: 'partner',
    fullName: 'Adera Sorting Facility - Bole Lemi',
    phone: '+251931000002',
    isFacility: true,
    location: 'Bole Lemi Industrial Park, Addis Ababa'
  },
  // Standard Partners (20)
  { email: 'partner.bole@mbet.com', role: 'partner', fullName: 'Bole Dropoff Point', phone: '+251941000001', location: 'Bole, near Edna Mall' },
  { email: 'partner.piassa@mbet.com', role: 'partner', fullName: 'Piassa Dropoff Point', phone: '+251941000002', location: 'Piassa, Tomoca Coffee Area' },
  { email: 'partner.kazanchis@mbet.com', role: 'partner', fullName: 'Kazanchis Dropoff Point', phone: '+251941000003', location: 'Kazanchis, next to UN ECA' },
  { email: 'partner.4kilo@mbet.com', role: 'partner', fullName: '4 Kilo Dropoff Point', phone: '+251941000004', location: 'Arat Kilo, near AAU' },
  { email: 'partner.megenagna@mbet.com', role: 'partner', fullName: 'Megenagna Dropoff Point', phone: '+251941000005', location: 'Megenagna, Zefmesh Grand Mall' },
  { email: 'partner.ayat@mbet.com', role: 'partner', fullName: 'Ayat Dropoff Point', phone: '+251941000006', location: 'Ayat, Ayat Condominiums' },
  { email: 'partner.sarbet@mbet.com', role: 'partner', fullName: 'Sarbet Dropoff Point', phone: '+251941000007', location: 'Sarbet, opposite Adams Pavilion' },
  { email: 'partner.oldairport@mbet.com', role: 'partner', fullName: 'Old Airport Dropoff Point', phone: '+251941000008', location: 'Old Airport, near ICS' },
  { email: 'partner.gotera@mbet.com', role: 'partner', fullName: 'Gotera Dropoff Point', phone: '+251941000009', location: 'Gotera, Agona Cinema' },
  { email: 'partner.mexico@mbet.com', role: 'partner', fullName: 'Mexico Dropoff Point', phone: '+251941000010', location: 'Mexico Square, Wabi Shebelle Hotel' },
  { email: 'partner.torhailoch@mbet.com', role: 'partner', fullName: 'Tor Hailoch Dropoff Point', phone: '+251941000011', location: 'Tor Hailoch, near the hospital' },
  { email: 'partner.jemo@mbet.com', role: 'partner', fullName: 'Jemo Dropoff Point', phone: '+251941000012', location: 'Jemo, behind Jemo Michael Church' },
  { email: 'partner.summit@mbet.com', role: 'partner', fullName: 'Summit Dropoff Point', phone: '+251941000013', location: 'Summit, Pepsi Area' },
  { email: 'partner.cmc@mbet.com', role: 'partner', fullName: 'CMC Dropoff Point', phone: '+251941000014', location: 'CMC, in front of St. Michael Church' },
  { email: 'partner.gerji@mbet.com', role: 'partner', fullName: 'Gerji Dropoff Point', phone: '+251941000015', location: 'Gerji, Unity University' },
  { email: 'partner.kality@mbet.com', role: 'partner', fullName: 'Kality Dropoff Point', phone: '+251941000016', location: 'Kality, near the bus station' },
  { email: 'partner.lideta@mbet.com', role: 'partner', fullName: 'Lideta Dropoff Point', phone: '+251941000017', location: 'Lideta, near the Federal High Court' },
  { email: 'partner.merkato@mbet.com', role: 'partner', fullName: 'Merkato Dropoff Point', phone: '+251941000018', location: 'Merkato, Anwar Mosque Area' },
  { email: 'partner.goro@mbet.com', role: 'partner', fullName: 'Goro Dropoff Point', phone: '+251941000019', location: 'Goro, near the driving license office' },
  { email: 'partner.5kilo@mbet.com', role: 'partner', fullName: '5 Kilo Dropoff Point', phone: '+251941000020', location: 'Sidist Kilo, near the National Museum' },
];

const main = async () => {
  console.log('--- Starting Seeding Script ---');
  console.log(`Creating ${usersToSeed.length} users with password: "${PASSWORD}"`);

  for (const userData of usersToSeed) {
    console.log(`\nProcessing: ${userData.email}`);

    // Step 1: Create the user in auth.users.
    // The `handle_new_user` trigger will automatically create a corresponding profile.
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: PASSWORD,
      phone: userData.phone,
      email_confirm: true, // Auto-confirm email for simplicity
      user_metadata: {
        full_name: userData.fullName,
        role: userData.role // Pass this so the trigger can create the profile with the correct role
      }
    });

    if (authError) {
      console.error(`- FAILED to create auth user: ${authError.message}`);
      continue;
    }
    
    const user = authData.user;
    console.log(`- SUCCESS: Created auth user ${user.email} (ID: ${user.id})`);
    
    // Step 2: Create role-specific data in other tables (partners, drivers).
    if (userData.role === 'partner') {
      const { error: partnerError } = await supabase
        .from('partners')
        .insert({
          id: user.id,
          location: userData.location,
          is_facility: userData.isFacility || false,
          working_hours: 'Mon-Sat, 9am - 6pm'
        });

      if (partnerError) {
        console.error(`- FAILED to create partner details: ${partnerError.message}`);
      } else {
        console.log('- SUCCESS: Created partner details.');
      }
    }

    if (userData.role === 'driver') {
      const { error: driverError } = await supabase
        .from('drivers')
        .insert({
          id: user.id,
          vehicle_details: userData.vehicleDetails
        });

      if (driverError) {
        console.error(`- FAILED to create driver details: ${driverError.message}`);
      } else {
        console.log('- SUCCESS: Created driver details.');
      }
    }
  }

  console.log('\n--- Seeding Script Finished ---');
};

main().catch(console.error); 