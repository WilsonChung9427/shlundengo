import type { FastifyInstance } from "fastify";

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID!;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET!;
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI!;
const FRONTEND_URL = "http://localhost:5173";

interface DiscordUser {
  id: string;
  username: string;
  avatar: string | null;
  global_name: string | null;
}

export async function authRoutes(app: FastifyInstance) {
  // GET /api/auth/discord/login — redirect the user to Discord's authorization screen
  app.get("/api/auth/discord/login", async (request, reply) => {
    const params = new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      redirect_uri: DISCORD_REDIRECT_URI,
      response_type: "code",
      scope: "identify",
    });

    return reply.redirect(`https://discord.com/oauth2/authorize?${params.toString()}`);
  });

  // GET /api/auth/discord/callback — Discord redirects here after the user approves
  app.get("/api/auth/discord/callback", async (request, reply) => {
    const { code } = request.query as { code?: string };

    if (!code) {
      return reply.status(400).send({ error: "Missing authorization code." });
    }

    // Exchange the authorization code for an access token
    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: DISCORD_REDIRECT_URI,
      }),
    });

    if (!tokenRes.ok) {
      app.log.error(await tokenRes.text());
      return reply.status(502).send({ error: "Failed to exchange code with Discord." });
    }

    const tokenData = (await tokenRes.json()) as { access_token: string };

    // Fetch the user's Discord profile using the access token
    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userRes.ok) {
      app.log.error(await userRes.text());
      return reply.status(502).send({ error: "Failed to fetch Discord user." });
    }

    const discordUser = (await userRes.json()) as DiscordUser;

    // Store the essentials in the encrypted session cookie
    request.session.set("discordUser", {
      id: discordUser.id,
      username: discordUser.global_name ?? discordUser.username,
      avatar: discordUser.avatar,
    });

    return reply.redirect(FRONTEND_URL);
  });

  // GET /api/me — returns the logged-in user's info, or 401 if not logged in
  app.get("/api/me", async (request, reply) => {
    const user = request.session.get("discordUser");

    if (!user) {
      return reply.status(401).send({ error: "Not logged in." });
    }

    return { data: user };
  });

  // POST /api/auth/logout — clears the session
  app.post("/api/auth/logout", async (request, reply) => {
    request.session.delete();
    return { success: true };
  });
}