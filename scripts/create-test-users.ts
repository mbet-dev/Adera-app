import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const testUsers = [
  {
    email: 'customer@test.com',
    password: 'Test123!',
    fullName: 'Test Customer',
    role: 'customer',
  },
  {
    email: 'driver@test.com',
    password: 'Test123!',
    fullName: 'Test Driver',
    role: 'driver',
  },
  {
    email: 'admin@test.com',
    password: 'Test123!',
    fullName: 'Test Admin',
    role: 'admin',
  },
];

async function createTestUsers() {
  for (const user of testUsers) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
          data: {
            full_name: user.fullName,
            role: user.role,
          },
        },
      });

      if (error) {
        console.error(`Error creating user ${user.email}:`, error.message);
      } else {
        console.log(`Successfully created user ${user.email}`);
      }
    } catch (error) {
      console.error(`Error creating user ${user.email}:`, error);
    }
  }
}

createTestUsers(); 