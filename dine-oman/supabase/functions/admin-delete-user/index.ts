// Dine Oman: permanently delete a user account. Admins only.
// Called from admin.html with the admin's own session token. The service role key never leaves the server.
// Deleting the auth user cascades to user_profiles, restaurants, favourites, history and reviews.
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const URL_ = Deno.env.get("SUPABASE_URL")!;
const cors = {
  "Access-Control-Allow-Origin": Deno.env.get("ALLOWED_ORIGIN") ?? "*",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

Deno.serve(async req => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: cors });

  // 1. Who is calling? Use their own token, so RLS applies.
  const caller = createClient(URL_, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } }, auth: { persistSession: false }
  });
  const { data: isAdmin } = await caller.rpc("is_admin");
  if (isAdmin !== true) return Response.json({ error: "Admins only." }, { status: 403, headers: cors });

  const { user_id } = await req.json().catch(() => ({}));
  if (typeof user_id !== "string" || !/^[0-9a-f-]{36}$/.test(user_id)) return Response.json({ error: "user_id is required." }, { status: 400, headers: cors });

  // 2. Act with the service role.
  const svc = createClient(URL_, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
  const { data: target } = await svc.from("user_profiles").select("role").eq("id", user_id).single();
  if (target?.role === "admin") return Response.json({ error: "Admin accounts can't be deleted here. Remove the admin role first." }, { status: 400, headers: cors });
  const { error } = await svc.auth.admin.deleteUser(user_id);
  if (error) return Response.json({ error: error.message }, { status: 500, headers: cors });
  return Response.json({ ok: true }, { headers: cors });
});
