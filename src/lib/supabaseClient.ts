import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://edmsihenresdnfztpgqm.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkbXNpaGVucmVzZG5menRwZ3FtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIyNTgzNjQsImV4cCI6MjEwNzgzNDM2NH0.PfIOem7XcN7qcdI0CLFeK62NHPZi-ygf6vdwIO4-VtQ';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
