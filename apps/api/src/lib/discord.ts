const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!;
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID!;
const DISCORD_PREMIUM_ROLE_ID = process.env.DISCORD_PREMIUM_ROLE_ID!;

interface GuildMember {
  roles: string[];
}

/**
 * Checks whether a given Discord user ID has the premium role
 * in our configured guild. Returns false for any failure case
 * (user not in the guild, API error, etc.) — fail closed, not open.
 */
export async function hasPremiumAccess(discordUserId: string): Promise<boolean> {
  try {
    const res = await fetch(
      `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/members/${discordUserId}`,
      {
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
        },
      }
    );

    if (!res.ok) {
      // 404 = user isn't in the guild at all — not an error, just not premium
      return false;
    }

    const member = (await res.json()) as GuildMember;
    return member.roles.includes(DISCORD_PREMIUM_ROLE_ID);
  } catch (err) {
    console.error("Discord role check failed:", err);
    return false;
  }
}