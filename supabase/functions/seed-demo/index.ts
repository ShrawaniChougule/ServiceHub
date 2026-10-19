import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Create demo accounts if they don't already exist
    const demos = [
      { email: "admin@servicehub.com", password: "admin123", full_name: "Admin User", role: "admin" },
      { email: "provider@servicehub.com", password: "provider123", full_name: "Rajesh Kumar", role: "provider" },
      { email: "customer@servicehub.com", password: "customer123", full_name: "Priya Sharma", role: "customer" },
    ];

    const results: { email: string; created: boolean; error?: string }[] = [];

    for (const d of demos) {
      const { data, error } = await supabase.auth.admin.createUser({
        email: d.email,
        password: d.password,
        email_confirm: true,
        user_metadata: { full_name: d.full_name, role: d.role },
      });

      if (error) {
        if (error.message.includes("already been registered") || error.message.includes("already exists")) {
          results.push({ email: d.email, created: false });
        } else {
          results.push({ email: d.email, created: false, error: error.message });
        }
        continue;
      }

      if (data.user) {
        await supabase.from("profiles").upsert({
          id: data.user.id,
          email: d.email,
          full_name: d.full_name,
          role: d.role,
        }, { onConflict: "id" });

        if (d.role === "provider") {
          await supabase.from("providers").upsert({
            id: data.user.id,
            bio: "Experienced electrician and plumber with 8+ years of service. Verified professional.",
            skills: ["Wiring", "Switch repair", "Pipe fitting", "Leak detection"],
            service_areas: ["Mumbai", "Pune", "Bengaluru"],
            is_verified: true,
          }, { onConflict: "id" });
        }
        results.push({ email: d.email, created: true });
      }
    }

    return new Response(
      JSON.stringify({ message: "Demo accounts ready", results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
