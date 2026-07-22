// api/strava/callback.js
// Vercel Serverless Function — handles Strava OAuth callback

export default async function handler(req, res) {
  const { code, error } = req.query;

  if (error || !code) {
    return res.redirect("/?strava_error=access_denied");
  }

  try {
    // Exchange code for tokens
    const tokenRes = await fetch("https://www.strava.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: "266921",
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenRes.json();

    if (!tokens.access_token) {
      console.error("Strava token error:", tokens);
      return res.redirect("/?strava_error=token_failed");
    }

    // Store tokens in Supabase
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseKey) {
      await fetch(`${supabaseUrl}/rest/v1/oauth_tokens`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
          "Prefer": "resolution=merge-duplicates",
        },
        body: JSON.stringify({
          provider: "strava",
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: new Date(tokens.expires_at * 1000).toISOString(),
          athlete_id: String(tokens.athlete?.id ?? ""),
        }),
      });
    }

    // Redirect back to app with success
    return res.redirect("/?strava_connected=true");

  } catch (err) {
    console.error("Strava callback error:", err);
    return res.redirect("/?strava_error=server_error");
  }
}
