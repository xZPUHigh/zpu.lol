// Live stats for the /zpu page — fetched server-side to avoid CORS.
// Not cached (Route Handlers are dynamic by default), so each poll is fresh.

async function getYouTubeSubs(): Promise<number | null> {
  // Primary: socialcounts (finer estimation value).
  try {
    const res = await fetch(
      "https://api.socialcounts.org/youtube-live-subscriber-count/UCgMktyw9e816q0GzhBL2dnQ",
      { cache: "no-store", headers: { "User-Agent": "Mozilla/5.0" } }
    );
    if (res.ok) {
      const d = await res.json();
      const v = d?.counters?.estimation?.subscriberCount ?? d?.counters?.api?.subscriberCount;
      if (typeof v === "number") return v;
    }
  } catch {
    /* try fallback */
  }
  // Fallback: mixerno.
  try {
    const res = await fetch(
      "https://mixerno.space/api/youtube-channel-counter/user/UCgMktyw9e816q0GzhBL2dnQ",
      { cache: "no-store", headers: { "User-Agent": "Mozilla/5.0" } }
    );
    if (res.ok) {
      const d = await res.json();
      const raw = d?.counts?.find((x: { value: string; count: number | string }) => x.value === "subscribers")?.count;
      const n = typeof raw === "string" ? parseInt(raw, 10) : raw;
      if (typeof n === "number" && !Number.isNaN(n)) return n;
    }
  } catch {
    /* give up */
  }
  return null;
}

async function getDiscordMembers(): Promise<number | null> {
  try {
    const res = await fetch(
      "https://discord.com/api/v9/invites/C3MpUNwsDU?with_counts=true",
      { cache: "no-store", headers: { "User-Agent": "Mozilla/5.0" } }
    );
    if (!res.ok) return null;
    const d = await res.json();
    return d?.approximate_member_count ?? null;
  } catch {
    return null;
  }
}

export async function GET() {
  const [ytSubs, discordMembers] = await Promise.all([getYouTubeSubs(), getDiscordMembers()]);
  return Response.json(
    { ytSubs, discordMembers },
    { headers: { "Cache-Control": "no-store" } }
  );
}
