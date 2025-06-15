
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const { join_token, user_id } = await req.json();

    // Validate params
    if (!join_token || !user_id) {
      return new Response(JSON.stringify({ error: "Token and user_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch join link info from DB
    const resp = await fetch(`${supabaseUrl}/rest/v1/team_join_links?token=eq.${join_token}&used=eq.false&select=*`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
      },
    });
    const links = await resp.json();

    if (!links || !Array.isArray(links) || links.length === 0) {
      return new Response(JSON.stringify({ error: "This link is invalid or already used." }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const link = links[0];

    // Check if expired
    const now = new Date();
    if (new Date(link.expires_at).getTime() < now.getTime()) {
      return new Response(JSON.stringify({ error: "This link has expired." }), {
        status: 410,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user in team
    const teamMemberResp = await fetch(`${supabaseUrl}/rest/v1/team_members?user_id=eq.${user_id}`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
      },
    });
    const userTeams = await teamMemberResp.json();
    if (userTeams && userTeams.length > 0) {
      return new Response(JSON.stringify({ error: "You are already in a team." }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Join the team (insert into team_members)
    const joinResp = await fetch(`${supabaseUrl}/rest/v1/team_members`, {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        team_id: link.team_id,
        user_id,
      }),
    });
    if (!joinResp.ok) {
      return new Response(JSON.stringify({ error: "Could not join team." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mark the link as used
    await fetch(`${supabaseUrl}/rest/v1/team_join_links?id=eq.${link.id}`, {
      method: "PATCH",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ used: true }),
    });

    return new Response(JSON.stringify({ message: "Joined team successfully!" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Unexpected error: " + err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
