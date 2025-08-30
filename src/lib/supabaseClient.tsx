// src/lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://nrlrqnecgtjnraabliaj.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ybHJxbmVjZ3RqbnJhYWJsaWFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MDQzNTksImV4cCI6MjA2NTQ4MDM1OX0.SwZAGFqz_J5BkS7RtzYm89kZj9WffKA-eCDX00btxH8";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
