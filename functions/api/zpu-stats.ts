// Cloudflare Pages Function: /api/zpu-stats
export async function onRequestGet() {
  let ytSubs: number | null = null;
  let discordMembers: number | null = null;

  try {
    const res = await fetch(
      "https://api.socialcounts.org/youtube-live-subscriber-count/UCgMktyw9e816q0GzhBL2dnQ",
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );
    if (res.ok) {
      const d: any = await res.json();
      ytSubs = d?.counters?.estimation?.subscriberCount ?? d?.counters?.api?.subscriberCount ?? null;
    }
  } catch {}

  try {
    const res = await fetch(
      "https://discord.com/api/v9/invites/C3MpUNwsDU?with_counts=true",
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );
    if (res.ok) {
      const d: any = await res.json();
      discordMembers = d?.approximate_member_count ?? null;
    }
  } catch {}

  return new Response(JSON.stringify({ ytSubs, discordMembers }), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=60, s-maxage=300",
    },
  });
}
