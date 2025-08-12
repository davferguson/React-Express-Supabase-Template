import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Ensure environment variables are loaded before reading process.env
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL as string | undefined;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.error('Supabase env vars are missing. Set SUPABASE_URL and SUPABASE_ANON_KEY.');
  throw new Error('Missing required Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


