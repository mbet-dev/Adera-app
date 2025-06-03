import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load .env file
const envPath = path.resolve(process.cwd(), '.env');
console.log('Looking for .env file at:', envPath);
console.log('File exists:', fs.existsSync(envPath));

dotenv.config();

// Debug: Print all environment variables
console.log('Environment variables:');
console.log('EXPO_PUBLIC_SUPABASE_URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'exists' : 'missing');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

function splitSQLStatements(sql: string): string[] {
  const statements: string[] = [];
  let currentStatement = '';
  let inDollarQuote = false;
  let dollarTag = '';

  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];
    const nextChar = sql[i + 1];

    // Handle dollar quoting
    if (char === '$' && nextChar === '$') {
      if (!inDollarQuote) {
        // Start of dollar quote
        inDollarQuote = true;
        dollarTag = '$$';
        currentStatement += '$$';
        i++; // Skip next $
      } else {
        // End of dollar quote
        inDollarQuote = false;
        currentStatement += '$$';
        i++; // Skip next $
      }
      continue;
    }

    // Handle semicolons
    if (char === ';' && !inDollarQuote) {
      currentStatement += ';';
      if (currentStatement.trim()) {
        statements.push(currentStatement.trim());
      }
      currentStatement = '';
      continue;
    }

    currentStatement += char;
  }

  // Add any remaining statement
  if (currentStatement.trim()) {
    statements.push(currentStatement.trim());
  }

  return statements;
}

async function applySchema() {
  try {
    const schemaPath = path.join(__dirname, 'initial_schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split the schema into individual statements
    const statements = splitSQLStatements(schema);

    // Execute each statement
    for (const statement of statements) {
      if (!statement.trim()) continue;
      
      console.log('Executing statement:', statement.substring(0, 100) + '...');
      const { error } = await supabase.rpc('exec_sql', { sql: statement });
      
      if (error) {
        console.error('Error executing statement:', error.message);
        console.error('Statement:', statement);
        process.exit(1);
      }
    }

    console.log('Schema applied successfully');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

applySchema(); 