import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uqpowkhohscsznlryinv.supabase.co';
const supabaseAnonKey = 'sb_publishable_2zDPhZCK9Sc0s4Evm-XlNg_PbqupOMZ';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const commonRpcs = ['exec_sql', 'execute_sql', 'run_sql', 'sql', 'query'];
  for (const rpc of commonRpcs) {
    console.log(`Testing RPC: ${rpc}`);
    const { data, error } = await supabase.rpc(rpc, { sql: 'select 1;' });
    if (error) {
      console.log(`RPC ${rpc} failed with code ${error.code}: ${error.message}`);
    } else {
      console.log(`RPC ${rpc} SUCCEEDED! Response:`, data);
    }
  }
}

test();
