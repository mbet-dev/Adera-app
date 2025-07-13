// seed_data.js
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// --- DEBUGGING START ---
console.log('DEBUG: SUPABASE_URL detected:', supabaseUrl ? 'Loaded' : 'NOT LOADED');
console.log('DEBUG: SUPABASE_SERVICE_ROLE_KEY detected:', supabaseServiceRoleKey ? 'Loaded (first 5 chars: ' + supabaseServiceRoleKey.substring(0, 5) + ')' : 'NOT LOADED');
// --- DEBUGGING END ---

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in your .env file or environment variables.');
  process.exit(1);
}

// Initialize Supabase client with the service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false, // Don't persist session for server-side script
  },
});

const usersToCreate = [
  // Customers
  { email: 'abebe.k@example.com', password: 'mbet321', role: 'customer', fullName: 'Abebe Kebede', phoneNumber: '+251911000001' },
  { email: 'chaltu.d@example.com', password: 'mbet321', role: 'customer', fullName: 'Chaltu Demeke', phoneNumber: '+251911000002' },
  { email: 'biruk.t@example.com', password: 'mbet321', role: 'customer', fullName: 'Biruk Tesfaye', phoneNumber: '+251911000003' },
  { email: 'selamawit.e@example.com', password: 'mbet321', role: 'customer', fullName: 'Selamawit Eshetu', phoneNumber: '+251911000004' },
  { email: 'dawit.m@example.com', password: 'mbet321', role: 'customer', fullName: 'Dawit Mekonnen', phoneNumber: '+251911000005' },
  { email: 'aster.h@example.com', password: 'mbet321', role: 'customer', fullName: 'Aster Hailu', phoneNumber: '+251911000006' },
  { email: 'girma.k@example.com', password: 'mbet321', role: 'customer', fullName: 'Girma Kassahun', phoneNumber: '+251911000007' },
  { email: 'hanna.l@example.com', password: 'mbet321', role: 'customer', fullName: 'Hanna Lemma', phoneNumber: '+251911000008' },
  { email: 'kedir.a@example.com', password: 'mbet321', role: 'customer', fullName: 'Kedir Ahmed', phoneNumber: '+251911000009' },
  { email: 'lensa.a@example.com', password: 'mbet321', role: 'customer', fullName: 'Lensa Abera', phoneNumber: '+251911000010' },

  // Admins
  { email: 'admin1@adera.com', password: 'mbet321', role: 'admin', fullName: 'Admin One', phoneNumber: '+251912000001' },
  { email: 'admin2@adera.com', password: 'mbet321', role: 'admin', fullName: 'Admin Two', phoneNumber: '+251912000002' },

  // Drivers
  { email: 'driver.a@adera.com', password: 'mbet321', role: 'driver', fullName: 'Driver A', phoneNumber: '+251913000001' },
  { email: 'driver.b@adera.com', password: 'mbet321', role: 'driver', fullName: 'Driver B', phoneNumber: '+251913000002' },
  { email: 'driver.c@adera.com', password: 'mbet321', role: 'driver', fullName: 'Driver C', phoneNumber: '+251913000003' },
  { email: 'driver.d@adera.com', password: 'mbet321', role: 'driver', fullName: 'Driver D', phoneNumber: '+251913000004' },

  // Staff
  { email: 'staff.x@adera.com', password: 'mbet321', role: 'staff', fullName: 'Staff X', phoneNumber: '+251914000001' },
  { email: 'staff.y@adera.com', password: 'mbet321', role: 'staff', fullName: 'Staff Y', phoneNumber: '+251914000002' },
  { email: 'staff.z@adera.com', password: 'mbet321', role: 'staff', fullName: 'Staff Z', phoneNumber: '+251914000003' },

  // Partners (including existing and new sorting hubs)
  { email: 'adama.k@partner.com', password: 'mbet321', role: 'partner', fullName: 'Adama Kifle', phoneNumber: '+251915000001' },
  { email: 'blen.f@partner.com', password: 'mbet321', role: 'partner', fullName: 'Blen Fikadu', phoneNumber: '+251915000002' },
  { email: 'chereka.g@partner.com', password: 'mbet321', role: 'partner', fullName: 'Chereka Gizaw', phoneNumber: '+251915000003' },
  { email: 'daniel.b@partner.com', password: 'mbet321', role: 'partner', fullName: 'Daniel Bekele', phoneNumber: '+251915000004' },
  { email: 'elias.a@partner.com', password: 'mbet321', role: 'partner', fullName: 'Elias Abebe', phoneNumber: '+251915000005' },
  { email: 'fikirte.g@partner.com', password: 'mbet321', role: 'partner', fullName: 'Fikirte Getachew', phoneNumber: '+251915000006' },
  { email: 'gelila.t@partner.com', password: 'mbet321', role: 'partner', fullName: 'Gelila Tesfaye', phoneNumber: '+251915000007' },
  { email: 'henok.s@partner.com', password: 'mbet321', role: 'partner', fullName: 'Henok Sisay', phoneNumber: '+251915000008' },
  { email: 'iris.z@partner.com', password: 'mbet321', role: 'partner', fullName: 'Iris Zewdu', phoneNumber: '+251915000009' },
  { email: 'kaleab.d@partner.com', password: 'mbet321', role: 'partner', fullName: 'Kaleab Desta', phoneNumber: '+251915000010' },
  { email: 'lelise.m@partner.com', password: 'mbet321', role: 'partner', fullName: 'Lelise Mengistu', phoneNumber: '+251915000011' },
  { email: 'marta.k@partner.com', password: 'mbet321', role: 'partner', fullName: 'Marta Kebede', phoneNumber: '+251915000012' },
  { email: 'nardos.w@partner.com', password: 'mbet321', role: 'partner', fullName: 'Nardos Wolde', phoneNumber: '+251915000013' },
  { email: 'oliyad.t@partner.com', password: 'mbet321', role: 'partner', fullName: 'Oliyad Tesfaye', phoneNumber: '+251915000014' },
  { email: 'peace.g@partner.com', password: 'mbet321', role: 'partner', fullName: 'Peace Genet', phoneNumber: '+251915000015' },
  { email: 'qerensa.b@partner.com', password: 'mbet321', role: 'partner', fullName: 'Qerensa Belay', phoneNumber: '+251915000016' },
  { email: 'redeat.a@partner.com', password: 'mbet321', role: 'partner', fullName: 'Redeat Abebe', phoneNumber: '+251915000017' },
  { email: 'samrawit.b@partner.com', password: 'mbet321', role: 'partner', fullName: 'Samrawit Bekele', phoneNumber: '+251915000018' },
  { email: 'tigist.a@partner.com', password: 'mbet321', role: 'partner', fullName: 'Tigist Alemayehu', phoneNumber: '+251915000019' },
  { email: 'ujulu.k@partner.com', password: 'mbet321', role: 'partner', fullName: 'Ujulu Kebede', phoneNumber: '+251915000020' },
  { email: 'wondwosen.t@partner.com', password: 'mbet321', role: 'partner', fullName: 'Wondwosen Tsegaye', phoneNumber: '+251915000021' },
  { email: 'kidus.g@partner.com', password: 'mbet321', role: 'partner', fullName: 'Kidus Getachew', phoneNumber: '+251915000022' },
  { email: 'yonas.l@partner.com', password: 'mbet321', role: 'partner', fullName: 'Yonas Legesse', phoneNumber: '+251915000023' },
  { email: 'zerihun.a@partner.com', password: 'mbet321', role: 'partner', fullName: 'Zerihun Amare', phoneNumber: '+251915000024' },
  { email: 'almaz.d@partner.com', password: 'mbet321', role: 'partner', fullName: 'Almaz Desta', phoneNumber: '+251915000025' },
  // New Sorting Hubs
  { email: 'sortinghub.5kilo@adera.com', password: 'mbet321', role: 'partner', fullName: '5 Kilo Sorting Hub', phoneNumber: '+251915000050', isSortingHub: true },
  { email: 'sortinghub.kality@adera.com', password: 'mbet321', role: 'partner', fullName: 'Kality Sorting Hub', phoneNumber: '+251915000051', isSortingHub: true },
];

async function seedData() {
  console.log('Starting data seeding...');

  try {
    // 1. Clear existing data to ensure a fresh start (Idempotency)
    console.log('Clearing existing data from public tables...');
    await supabase.from('events_log').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows
    await supabase.from('parcels').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('shop_transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('order_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('shops').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('partners').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Fetch all existing auth.users and delete them if they are part of our seed list
    const { data: existingUsers, error: fetchError } = await supabase.auth.admin.listUsers();
    if (fetchError) throw fetchError;

    if (existingUsers && existingUsers.users.length > 0) {
      console.log(`Checking for and deleting ${existingUsers.users.length} existing auth.users...`);
      for (const user of existingUsers.users) {
        if (usersToCreate.some(u => u.email === user.email)) {
          const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
          if (deleteError) {
            console.warn(`Failed to delete user ${user.email}:`, deleteError.message);
          } else {
            console.log(`Deleted user: ${user.email}`);
          }
        } else {
          console.log(`Skipping deletion for non-seed user: ${user.email}`);
        }
      }
    } else {
      console.log('No existing auth.users to delete from seed list.');
    }


    // 2. Create users in auth.users via Admin API and populate public.profiles
    console.log('Creating auth.users and public.profiles...');
    const createdUserIds = {}; // To store user_id mapped to email

    for (const userData of usersToCreate) {
      const { email, password, role, fullName, phoneNumber } = userData;
      const { data: userResponse, error: userError } = await supabase.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          full_name: fullName,
          role: role,
          phone_number: phoneNumber,
        },
        app_metadata: {
          role: role, // Store role in app_metadata for RLS
        },
      });

      if (userError) {
        // If user already exists (e.g., if script was partially run before), log and skip creation
        if (userError.message.includes('AuthApiError: User already registered')) {
          console.warn(`User ${email} already registered. Skipping creation and trying to fetch existing user for profile linking.`);
          const { data: existingUser, error: fetchExistingError } = await supabase.auth.admin.getUserByEmail(email);
          if (fetchExistingError) {
            console.error(`Error fetching existing user ${email}:`, fetchExistingError.message);
            continue; // Skip this user if unable to fetch
          }
          userResponse.user = existingUser.user;
        } else {
          console.error(`Error creating user ${email}:`, userError.message);
          continue; // Skip this user if creation fails for other reasons
        }
      }

      const userId = userResponse.user.id;
      createdUserIds[email] = userId;

      // Insert into public.profiles
      const { error: profileError } = await supabase.from('profiles').upsert({ // Using upsert for idempotency
        id: userId,
        full_name: fullName,
        email: email,
        phone_number: phoneNumber,
        role: role,
      }, { onConflict: 'id' });

      if (profileError) {
        console.error(`Error upserting profile for ${email}:`, profileError.message);
      } else {
        console.log(`Created/Upserted user and profile for: ${email} (${role})`);
      }
    }

    // 3. Populate public.partners
    console.log('Populating public.partners...');
    const partnersData = [
      {
        email: 'adama.k@partner.com', businessName: 'Adama Cafe & Bakery', legalRepresentativeName: 'Adama Kifle', phoneNumber: '+251915000001', businessCategory: 'Cafe',
        latitude: 9.01000000, longitude: 38.78000000, addressText: 'Bole Road, Addis Ababa', operatingHoursStart: '07:00:00', operatingHoursEnd: '20:00:00',
        acceptedPaymentMethods: ['Cash', 'Card'], businessLicenseUrl: 'https://example.com/adama_cafe_license.pdf', partnerLogoUrl: 'https://example.com/adama_cafe_logo.png', approved: true, isSortingHub: false
      },
      {
        email: 'blen.f@partner.com', businessName: 'Blen Supermarket', legalRepresentativeName: 'Blen Fikadu', phoneNumber: '+251915000002', businessCategory: 'Supermarket',
        latitude: 9.02000000, longitude: 38.77000000, addressText: 'Piaza, Addis Ababa', operatingHoursStart: '08:00:00', operatingHoursEnd: '22:00:00',
        acceptedPaymentMethods: ['Cash', 'Telebirr'], businessLicenseUrl: 'https://example.com/blen_supermarket_license.pdf', partnerLogoUrl: 'https://example.com/blen_supermarket_logo.png', approved: true, isSortingHub: false
      },
      {
        email: 'chereka.g@partner.com', businessName: 'Chereka Electronics', legalRepresentativeName: 'Chereka Gizaw', phoneNumber: '+251915000003', businessCategory: 'Electronics',
        latitude: 9.00500000, longitude: 38.76500000, addressText: 'Merkato, Addis Ababa', operatingHoursStart: '09:00:00', operatingHoursEnd: '19:00:00',
        acceptedPaymentMethods: ['Cash', 'Card', 'Chapa'], businessLicenseUrl: 'https://example.com/chereka_electronics_license.pdf', partnerLogoUrl: 'https://example.com/chereka_electronics_logo.png', approved: true, isSortingHub: false
      },
      {
        email: 'daniel.b@partner.com', businessName: 'daniel Restaurant', legalRepresentativeName: 'daniel Bekele', phoneNumber: '+251915000004', businessCategory: 'Restaurant',
        latitude: 8.99000000, longitude: 38.78500000, addressText: 'Meskel Square, Addis Ababa', operatingHoursStart: '10:00:00', operatingHoursEnd: '23:00:00',
        acceptedPaymentMethods: ['Cash', 'Telebirr', 'ArifPay'], businessLicenseUrl: 'https://example.com/daniel_restaurant_license.pdf', partnerLogoUrl: 'https://example.com/daniel_restaurant_logo.png', approved: true, isSortingHub: false
      },
      {
        email: 'elias.a@partner.com', businessName: 'Elias Pharmacy', legalRepresentativeName: 'Elias Abebe', phoneNumber: '+251915000005', businessCategory: 'Pharmacy',
        latitude: 9.03000000, longitude: 38.75000000, addressText: 'Kazanchis, Addis Ababa', operatingHoursStart: '08:00:00', operatingHoursEnd: '20:00:00',
        acceptedPaymentMethods: ['Cash', 'Card'], businessLicenseUrl: 'https://example.com/elias_pharmacy_license.pdf', partnerLogoUrl: 'https://example.com/elias_pharmacy_logo.png', approved: true, isSortingHub: false
      },
      {
        email: 'fikirte.g@partner.com', businessName: 'Fikirte Boutique', legalRepresentativeName: 'Fikirte Getachew', phoneNumber: '+251915000006', businessCategory: 'Fashion',
        latitude: 9.01500000, longitude: 38.79000000, addressText: 'Megenagna, Addis Ababa', operatingHoursStart: '10:00:00', operatingHoursEnd: '21:00:00',
        acceptedPaymentMethods: ['Cash', 'Telebirr'], businessLicenseUrl: 'https://example.com/fikirte_boutique_license.pdf', partnerLogoUrl: 'https://example.com/fikirte_boutique_logo.png', approved: true, isSortingHub: false
      },
      {
        email: 'gelila.t@partner.com', businessName: 'Gelila Books & Stationery', legalRepresentativeName: 'Gelila Tesfaye', phoneNumber: '+251915000007', businessCategory: 'Books & Stationery',
        latitude: 9.00000000, longitude: 38.77500000, addressText: 'Arat Kilo, Addis Ababa', operatingHoursStart: '09:00:00', operatingHoursEnd: '18:00:00',
        acceptedPaymentMethods: ['Cash', 'Card'], businessLicenseUrl: 'https://example.com/gelila_books_license.pdf', partnerLogoUrl: 'https://example.com/gelila_books_logo.png', approved: true, isSortingHub: false
      },
      {
        email: 'henok.s@partner.com', businessName: 'Henok Autoparts', legalRepresentativeName: 'Henok Sisay', phoneNumber: '+251915000008', businessCategory: 'Automotive',
        latitude: 8.98000000, longitude: 38.79500000, addressText: 'Sar Bet, Addis Ababa', operatingHoursStart: '08:00:00', operatingHoursEnd: '18:00:00',
        acceptedPaymentMethods: ['Cash'], businessLicenseUrl: 'https://example.com/henok_autoparts_license.pdf', partnerLogoUrl: 'https://example.com/henok_autoparts_logo.png', approved: true, isSortingHub: false
      },
      {
        email: 'iris.z@partner.com', businessName: 'Iris Spa & Wellness', legalRepresentativeName: 'Iris Zewdu', phoneNumber: '+251915000009', businessCategory: 'Health & Beauty',
        latitude: 9.02500000, longitude: 38.78000000, addressText: 'Bole Atlas, Addis Ababa', operatingHoursStart: '10:00:00', operatingHoursEnd: '20:00:00',
        acceptedPaymentMethods: ['Cash', 'Card', 'Telebirr'], businessLicenseUrl: 'https://example.com/iris_spa_license.pdf', partnerLogoUrl: 'https://example.com/iris_spa_logo.png', approved: true, isSortingHub: false
      },
      {
        email: 'kaleab.d@partner.com', businessName: 'Kaleab Computer Repair', legalRepresentativeName: 'Kaleab Desta', phoneNumber: '+251915000010', businessCategory: 'Services',
        latitude: 9.01000000, longitude: 38.76000000, addressText: 'Mexico Square, Addis Ababa', operatingHoursStart: '09:00:00', operatingHoursEnd: '19:00:00',
        acceptedPaymentMethods: ['Cash'], businessLicenseUrl: 'https://example.com/kaleab_computer_license.pdf', partnerLogoUrl: 'https://example.com/kaleab_computer_logo.png', approved: true, isSortingHub: false
      },
      {
        email: 'lelise.m@partner.com', businessName: 'Lelise Grocery', legalRepresentativeName: 'Lelise Mengistu', phoneNumber: '+251915000011', businessCategory: 'Grocery',
        latitude: 9.03500000, longitude: 38.77000000, addressText: 'CMC, Addis Ababa', operatingHoursStart: '07:00:00', operatingHoursEnd: '21:00:00',
        acceptedPaymentMethods: ['Cash', 'Telebirr'], businessLicenseUrl: 'https://example.com/lelise_grocery_license.pdf', partnerLogoUrl: 'https://example.com/lelise_grocery_logo.png', approved: true, isSortingHub: false
      },
      {
        email: 'marta.k@partner.com', businessName: 'Marta Cafe', legalRepresentativeName: 'Marta Kebede', phoneNumber: '+251915000012', businessCategory: 'Cafe',
        latitude: 9.04000000, longitude: 38.76500000, addressText: 'Gerji, Addis Ababa', operatingHoursStart: '07:00:00', operatingHoursEnd: '20:00:00',
        acceptedPaymentMethods: ['Cash', 'Card'], businessLicenseUrl: 'https://example.com/marta_cafe_license.pdf', partnerLogoUrl: 'https://example.com/marta_cafe_logo.png', approved: true, isSortingHub: false
      },
      {
        email: 'nardos.w@partner.com', businessName: 'Nardos Giftshop', legalRepresentativeName: 'Nardos Wolde', phoneNumber: '+251915000013', businessCategory: 'Gift Shop',
        latitude: 9.00500000, longitude: 38.79500000, addressText: '22 Mazoria, Addis Ababa', operatingHoursStart: '09:00:00', operatingHoursEnd: '21:00:00',
        acceptedPaymentMethods: ['Cash', 'Telebirr'], businessLicenseUrl: 'https://example.com/nardos_gift_license.pdf', partnerLogoUrl: 'https://example.com/nardos_gift_logo.png', approved: true, isSortingHub: false
      },
      {
        email: 'oliyad.t@partner.com', businessName: 'Oliyad Hardware', legalRepresentativeName: 'Oliyad Tesfaye', phoneNumber: '+251915000014', businessCategory: 'Hardware',
        latitude: 8.99500000, longitude: 38.75500000, addressText: 'Akaki, Addis Ababa', operatingHoursStart: '07:00:00', operatingHoursEnd: '18:00:00',
        acceptedPaymentMethods: ['Cash'], businessLicenseUrl: 'https://example.com/oliyad_hardware_license.pdf', partnerLogoUrl: 'https://example.com/oliyad_hardware_logo.png', approved: true, isSortingHub: false
      },
      {
        email: 'peace.g@partner.com', businessName: 'Peace Bakery', legalRepresentativeName: 'Peace Genet', phoneNumber: '+251915000015', businessCategory: 'Bakery',
        latitude: 9.01800000, longitude: 38.78800000, addressText: 'Summit, Addis Ababa', operatingHoursStart: '06:00:00', operatingHoursEnd: '20:00:00',
        acceptedPaymentMethods: ['Cash', 'Telebirr'], businessLicenseUrl: 'https://example.com/peace_bakery_license.pdf', partnerLogoUrl: 'https://example.com/peace_bakery_logo.png', approved: true, isSortingHub: false
      },
      {
        email: 'qerensa.b@partner.com', businessName: 'Qerensa Art Gallery', legalRepresentativeName: 'Qerensa Belay', phoneNumber: '+251915000016', businessCategory: 'Art & Decor',
        latitude: 9.00000000, longitude: 38.79000000, addressText: 'Bole Rwanda, Addis Ababa', operatingHoursStart: '10:00:00', operatingHoursEnd: '20:00:00',
        acceptedPaymentMethods: ['Cash', 'Card'], businessLicenseUrl: 'https://example.com/qerensa_art_license.pdf', partnerLogoUrl: 'https://example.com/qerensa_art_logo.png', approved: true, isSortingHub: false
      },
      {
        email: 'redeat.a@partner.com', businessName: 'Redeat Laundry Services', legalRepresentativeName: 'Redeat Abebe', phoneNumber: '+251915000017', businessCategory: 'Services',
        latitude: 9.02200000, longitude: 38.76700000, addressText: 'Sar Bet, Addis Ababa', operatingHoursStart: '08:00:00', operatingHoursEnd: '19:00:00',
        acceptedPaymentMethods: ['Cash'], businessLicenseUrl: 'https://example.com/redeat_laundry_license.pdf', partnerLogoUrl: 'https://example.com/redeat_laundry_logo.png', approved: true, isSortingHub: false
      },
      {
        email: 'samrawit.b@partner.com', businessName: 'Samrawit Butchery', legalRepresentativeName: 'Samrawit Bekele', phoneNumber: '+251915000018', businessCategory: 'Food & Meat',
        latitude: 8.98500000, longitude: 38.77800000, addressText: 'Kera, Addis Ababa', operatingHoursStart: '06:00:00', operatingHoursEnd: '18:00:00',
        acceptedPaymentMethods: ['Cash'], businessLicenseUrl: 'https://example.com/samrawit_butchery_license.pdf', partnerLogoUrl: 'https://example.com/samrawit_butchery_logo.png', approved: true, isSortingHub: false
      },
      {
        email: 'tigist.a@partner.com', businessName: 'Tigist Fashion Store', legalRepresentativeName: 'Tigist Alemayehu', phoneNumber: '+251915000019', businessCategory: 'Fashion',
        latitude: 9.03000000, longitude: 38.78500000, addressText: 'Lideta, Addis Ababa', operatingHoursStart: '09:00:00', operatingHoursEnd: '21:00:00',
        acceptedPaymentMethods: ['Cash', 'Telebirr', 'Chapa'], businessLicenseUrl: 'https://example.com/tigist_fashion_license.pdf', partnerLogoUrl: 'https://example.com/tigist_fashion_logo.png', approved: true, isSortingHub: false
      },
      {
        email: 'ujulu.k@partner.com', businessName: 'Ujulu Organic Vegetables', legalRepresentativeName: 'Ujulu Kebede', phoneNumber: '+251915000020', businessCategory: 'Grocery',
        latitude: 9.01500000, longitude: 38.75000000, addressText: 'Shola, Addis Ababa', operatingHoursStart: '07:00:00', operatingHoursEnd: '19:00:00',
        acceptedPaymentMethods: ['Cash'], businessLicenseUrl: 'https://example.com/ujulu_vegetables_license.pdf', partnerLogoUrl: 'https://example.com/ujulu_vegetables_logo.png', approved: true, isSortingHub: false
      },
      {
        email: 'wondwosen.t@partner.com', businessName: 'Wondwosen Metal Works', legalRepresentativeName: 'Wondwosen Tsegaye', phoneNumber: '+251915000021', businessCategory: 'Manufacturing',
        latitude: 8.99000000, longitude: 38.76000000, addressText: 'Gofa, Addis Ababa', operatingHoursStart: '08:00:00', operatingHoursEnd: '17:00:00',
        acceptedPaymentMethods: ['Cash'], businessLicenseUrl: 'https://example.com/wondwosen_metals_license.pdf', partnerLogoUrl: 'https://example.com/wondwosen_metals_logo.png', approved: true, isSortingHub: false
      },
      {
        email: 'Kidus.g@partner.com', businessName: 'Kidus Fitness Center', legalRepresentativeName: 'Kidus Getachew', phoneNumber: '+251915000022', businessCategory: 'Fitness',
        latitude: 9.00800000, longitude: 38.78200000, addressText: 'Bole Medhanialem, Addis Ababa', operatingHoursStart: '06:00:00', operatingHoursEnd: '22:00:00',
        acceptedPaymentMethods: ['Cash', 'Card'], businessLicenseUrl: 'https://example.com/Kidus_fitness_license.pdf', partnerLogoUrl: 'https://example.com/Kidus_fitness_logo.png', approved: true, isSortingHub: false
      },
      {
        email: 'yonas.l@partner.com', businessName: 'Yonas Printing Services', legalRepresentativeName: 'Yonas Legesse', phoneNumber: '+251915000023', businessCategory: 'Printing',
        latitude: 9.02000000, longitude: 38.76000000, addressText: 'Megenagna, Addis Ababa', operatingHoursStart: '09:00:00', operatingHoursEnd: '18:00:00',
        acceptedPaymentMethods: ['Cash'], businessLicenseUrl: 'https://example.com/yonas_printing_license.pdf', partnerLogoUrl: 'https://example.com/yonas_printing_logo.png', approved: true, isSortingHub: false
      },
      {
        email: 'zerihun.a@partner.com', businessName: 'Zerihun Tyre Shop', legalRepresentativeName: 'Zerihun Amare', phoneNumber: '+251915000024', businessCategory: 'Automotive',
        latitude: 9.00500000, longitude: 38.74000000, addressText: 'Gordem, Addis Ababa', operatingHoursStart: '08:00:00', operatingHoursEnd: '17:00:00',
        acceptedPaymentMethods: ['Cash'], businessLicenseUrl: 'https://example.com/zerihun_tire_license.pdf', partnerLogoUrl: 'https://example.com/zerihun_tire_logo.png', approved: true, isSortingHub: false
      },
      {
        email: 'almaz.d@partner.com', businessName: 'Almaz Designs', legalRepresentativeName: 'Almaz Desta', phoneNumber: '+251915000025', businessCategory: 'Interior Design',
        latitude: 9.00000000, longitude: 38.77000000, addressText: 'Bole, Addis Ababa', operatingHoursStart: '09:00:00', operatingHoursEnd: '19:00:00',
        acceptedPaymentMethods: ['Cash', 'Card'], businessLicenseUrl: 'https://example.com/almaz_designs_license.pdf', partnerLogoUrl: 'https://example.com/almaz_designs_logo.png', approved: true, isSortingHub: false
      },
      // Sorting Hubs
      {
        email: 'sortinghub.5kilo@adera.com', businessName: '5 Kilo Sorting Facility Hub', legalRepresentativeName: 'Sorting Staff', phoneNumber: '+251915000050', businessCategory: 'Sorting Facility',
        latitude: 9.0476, longitude: 38.7612, addressText: '5 Kilo, Addis Ababa', operatingHoursStart: '06:00:00', operatingHoursEnd: '22:00:00',
        acceptedPaymentMethods: ['Cash', 'Card'], businessLicenseUrl: null, partnerLogoUrl: null, approved: true, isSortingHub: true
      },
      {
        email: 'sortinghub.kality@adera.com', password: 'mbet321', role: 'partner', fullName: 'Kality Sorting Hub', phoneNumber: '+251915000051', isSortingHub: true },
    ];

    for (const partnerData of partnersData) {
      const profileId = createdUserIds[partnerData.email];
      if (!profileId) {
        console.warn(`Profile ID not found for partner ${partnerData.email}. Skipping partner insertion.`);
        continue;
      }
      const { data, error } = await supabase.from('partners').upsert({ // Using upsert for idempotency
        profile_id: profileId,
        business_name: partnerData.businessName,
        legal_representative_name: partnerData.legalRepresentativeName,
        phone_number: partnerData.phoneNumber,
        email_address: partnerData.email,
        business_category: partnerData.businessCategory,
        shop_location_latitude: partnerData.latitude,
        shop_location_longitude: partnerData.longitude,
        address_text: partnerData.addressText,
        operating_hours_start: partnerData.operatingHoursStart,
        operating_hours_end: partnerData.operatingHoursEnd,
        accepted_payment_methods: partnerData.acceptedPaymentMethods,
        business_license_url: partnerData.businessLicenseUrl,
        partner_logo_url: partnerData.partnerLogoUrl,
        approved: partnerData.approved,
        is_sorting_hub: partnerData.isSortingHub || false, // Ensure this is set
      }, { onConflict: 'email_address' }); // Use email_address for conflict as it's unique

      if (error) {
        console.error(`Error upserting partner ${partnerData.businessName}:`, error.message);
      } else {
        console.log(`Upserted partner: ${partnerData.businessName}`);
      }
    }

    // 4. Populate public.shops, categories, items, orders, order_items, parcels, events_log
    console.log('Populating e-commerce and parcel data...');

    // Get partner IDs to link shops
    const { data: allPartners, error: fetchPartnersError } = await supabase.from('partners').select('id, profile_id, business_name');
    if (fetchPartnersError) throw fetchPartnersError;

    const partnerIdMap = {}; // Map profile_id to partner_id
    allPartners.forEach(p => {
      if (p.profile_id) partnerIdMap[p.profile_id] = p.id;
    });

    const shopIds = {};
    for (const partner of allPartners) {
      if (partner.business_name.includes('Cafe') || partner.business_name.includes('Supermarket') || partner.business_name.includes('Electronics')) {
        const { data: shop, error } = await supabase.from('shops').upsert({ // Using upsert for idempotency
          partner_id: partner.id,
          shop_name: `${partner.business_name}'s E-Shop`,
          description: `Online shop for ${partner.business_name}.`,
          banner_url: `https://example.com/${partner.business_name.toLowerCase().replace(/\s/g, '-')}-banner.png`,
          logo_url: `https://example.com/${partner.business_name.toLowerCase().replace(/\s/g, '-')}-logo.png`,
          approved: true,
        }, { onConflict: 'partner_id' }).select(); // Conflict on partner_id assuming one shop per partner
        if (error) {
          console.error(`Error upserting shop for ${partner.business_name}:`, error.message);
        } else if (shop && shop.length > 0) {
          shopIds[partner.id] = shop[0].id;
          console.log(`Upserted shop for ${partner.business_name}`);

          // Categories for this shop
          const { data: category, error: catError } = await supabase.from('categories').upsert({ // Using upsert
            shop_id: shop[0].id,
            name: 'General Items',
            icon_url: 'https://example.com/icon.png'
          }, { onConflict: 'shop_id,name' }).select();
          if (catError) console.error(`Error upserting category for shop ${shop[0].shop_name}:`, catError.message);
          const categoryId = category && category.length > 0 ? category[0].id : null;

          // Items for this shop
          if (categoryId) {
            await supabase.from('items').upsert([ // Using upsert
              {
                shop_id: shop[0].id, category_id: categoryId, name: 'Sample Item 1', description: 'A test item for your shop.',
                price: 100.00, quantity: 10, image_urls: ['https://example.com/item1.png'], delivery_supported: true
              },
              {
                shop_id: shop[0].id, category_id: categoryId, name: 'Sample Item 2', description: 'Another test item.',
                price: 250.50, quantity: 5, image_urls: ['https://example.com/item2.png'], delivery_supported: true
              },
            ], { onConflict: 'shop_id,name' }); // Conflict on shop_id and name
            console.log(`Upserted items for shop ${shop[0].shop_name}`);
          }
        }
      }
    }

    // Sample Orders
    const { data: customers, error: fetchCustomersError } = await supabase.from('profiles').select('id, email').eq('role', 'customer');
    if (fetchCustomersError) throw fetchCustomersError;

    if (customers && customers.length > 0) {
      const customer1Id = customers[0].id;
      const { data: order1, error: orderError1 } = await supabase.from('orders').upsert({ // Using upsert
        id: '12345678-abcd-1234-abcd-123456789012', // Provide a fixed ID for idempotency, or manage
        buyer_id: customer1Id,
        total_amount: 350.50,
        payment_method: 'Telebirr',
        payment_status: 'paid',
        delivery_method: 'Adera Delivery',
        delivery_status: 'pending',
      }, { onConflict: 'id' }).select();
      if (orderError1) console.error('Error upserting order 1:', orderError1.message);

      if (order1 && order1.length > 0) {
        const itemForOrder = await supabase.from('items').select('id, price').limit(1);
        if (itemForOrder.data && itemForOrder.data.length > 0) {
          await supabase.from('order_items').upsert({ // Using upsert
            order_id: order1[0].id,
            item_id: itemForOrder.data[0].id,
            quantity: 1,
            price_at_time_of_order: itemForOrder.data[0].price,
          }, { onConflict: 'order_id,item_id' });
          console.log('Upserted order 1 with items');
        }
      }
    }

    // Sample Parcels
    const { data: profiles, error: fetchProfilesError } = await supabase.from('profiles').select('id, role, phone_number');
    if (fetchProfilesError) throw fetchProfilesError;

    const customerProfile = profiles.find(p => p.role === 'customer');
    const driverProfile = profiles.find(p => p.role === 'driver');
    const sortingHub5Kilo = allPartners.find(p => p.business_name === '5 Kilo Sorting Facility Hub');
    const sortingHubKality = allPartners.find(p => p.business_name === 'Kality Sorting Facility Hub');

    if (customerProfile && driverProfile && sortingHub5Kilo && sortingHubKality) {
      // Parcel 1: Customer to Customer via 5 Kilo Hub
      const { data: parcel1, error: parcelError1 } = await supabase.from('parcels').upsert({ // Using upsert
        id: 'aaaaaaab-1234-abcd-1234-567890123456', // Fixed ID for idempotency
        sender_id: customerProfile.id,
        recipient_name: 'Recipient A',
        recipient_phone: '+251911000100',
        item_type: 'Documents',
        dropoff_partner_id: sortingHub5Kilo.id,
        pickup_partner_id: sortingHubKality.id, // Example: drops at 5Kilo, picks up from Kality
        payment_method: 'Cash',
        payment_status: 'pending',
        tracking_code: 'ADERA-PCL-001',
        qr_code_url: 'https://example.com/qr/ADERA-PCL-001.png',
        status: 'dropped_off',
        current_location_latitude: 9.0476,
        current_location_longitude: 38.7612,
      }, { onConflict: 'id' }).select();
      if (parcelError1) console.error('Error upserting parcel 1:', parcelError1.message);
      if (parcel1 && parcel1.length > 0) {
        await supabase.from('events_log').upsert({ // Using upsert
          id: 'bbbbbbbc-1234-abcd-1234-567890123456', // Fixed ID for idempotency
          parcel_id: parcel1[0].id,
          event_type: 'parcel_dropped_off',
          event_description: 'Parcel dropped off at 5 Kilo Sorting Facility.',
          location_latitude: 9.0476,
          location_longitude: 38.7612,
          actor_id: customerProfile.id,
        }, { onConflict: 'id' });
        console.log('Upserted Parcel 1 and event log');
      }

      // Parcel 2: Customer to Customer (direct pickup)
      const { data: parcel2, error: parcelError2 } = await supabase.from('parcels').upsert({ // Using upsert
        id: 'cccccccc-1234-abcd-1234-567890123456', // Fixed ID for idempotency
        sender_id: customerProfile.id,
        recipient_name: 'Recipient B',
        recipient_phone: '+251911000101',
        item_type: 'Small Package',
        dropoff_partner_id: null,
        pickup_partner_id: null,
        payment_method: 'Telebirr',
        payment_status: 'paid',
        tracking_code: 'ADERA-PCL-002',
        qr_code_url: 'https://example.com/qr/ADERA-PCL-002.png',
        status: 'in_transit',
        current_location_latitude: 9.01000000,
        current_location_longitude: 38.78000000,
      }, { onConflict: 'id' }).select();
      if (parcelError2) console.error('Error upserting parcel 2:', parcelError2.message);
      if (parcel2 && parcel2.length > 0) {
        await supabase.from('events_log').upsert({ // Using upsert
          id: 'dddddddd-1234-abcd-1234-567890123456', // Fixed ID for idempotency
          parcel_id: parcel2[0].id,
          event_type: 'picked_up_by_driver',
          event_description: 'Parcel picked up by driver for delivery.',
          location_latitude: 9.01000000,
          location_longitude: 38.78000000,
          actor_id: driverProfile.id,
        }, { onConflict: 'id' });
        console.log('Upserted Parcel 2 and event log');
      }
    } else {
      console.warn('Could not create sample parcels: Missing customer, driver, or sorting hub profiles/partners.');
    }


    console.log('Data seeding completed successfully!');
  } catch (error) {
    console.error('An error occurred during data seeding:', error.message);
  } finally {
    // In a real application, you might want to close the connection or perform cleanup.
    // For this script, it will simply exit.
  }
}

seedData(); 