import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pnowmoquisuqomhfsvza.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_FBMRbDCZw-kZuhuHjDwtQQ_ajLWMtf6';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
