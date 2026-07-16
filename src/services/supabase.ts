import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://uqpowkhohscsznlryinv.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_2zDPhZCK9Sc0s4Evm-XlNg_PbqupOMZ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
