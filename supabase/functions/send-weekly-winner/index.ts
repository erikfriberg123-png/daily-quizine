import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL   = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE   = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const FROM_EMAIL     = Deno.env.get('FROM_EMAIL')!

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE)

// ─── Segment metadata ──────────────────────────────────────────────────────────

const SEGMENTS: Record<string, {
  displayName: string
  icon: string
  color1: string
  color2: string
  siteUrl: string
  questionsTable: string
}> = {
  quizine: {
    displayName: 'Quizine Daily',
    icon: '🎯',
    color1: '#C9922A',
    color2: '#C0441A',
    siteUrl: 'https://daily.quizine.se',
    questionsTable: 'remote_questions',
  },
  voo: {
    displayName: 'Vård & Omsorg',
    icon: '🩺',
    color1: '#1E88E5',
    color2: '#00ACC1',
    siteUrl: 'https://daily.voo.quizine.se',
    questionsTable: 'voo_remote_questions',
  },
  blaljus: {
    displayName: 'Blåljuspersonal',
    icon: '🚨',
    color1: '#E53935',
    color2: '#1565C0',
    siteUrl: 'https://daily.blaljus.quizine.se',
    questionsTable: 'blaljus_remote_questions',
  },
  it: {
    displayName: 'IT & Software',
    icon: '💻',
    color1: '#6C63FF',
    color2: '#00C9A7',
    siteUrl: 'https://daily.it.quizine.se',
    questionsTable: 'it_remote_questions',
  },
  handel: {
    displayName: 'Handel & Butik',
    icon: '🛒',
    color1: '#FF6B35',
    color2: '#F7B731',
    siteUrl: 'https://daily.handel.quizine.se',
    questionsTable: 'handels_remote_questions',
  },
}

// ─── Week bounds (Mon–Sun of the week ending now) ─────────────────────────────

function getLastWeekBounds(): { start: string; end: string } {
  const now = new Date(
    new Date().toLocaleString('en-US', { timeZone: 'Europe/Paris' })
  )
  const day = now.getDay() // 6 = Saturday when cron fires
  // Go back to Monday of the current week
  const diffToMonday = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setDate(now.getDate() + diffToMonday)
  // Sunday = Monday + 6 (matches the leaderboard's Mon–Sun window)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  const fmt = (d: Date) =>
    new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'Europe/Paris',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(d)

  return { start: fmt(monday), end: fmt(sunday) }
}

// ─── Email HTML ───────────────────────────────────────────────────────────────

function winnerEmailHtml(params: {
  username: string
  totalScore: number
  daysPlayed: number
  weekStart: string
  weekEnd: string
  segmentDisplayName: string
  segmentIcon: string
  color1: string
  color2: string
  siteUrl: string
}): string {
  const { username, totalScore, daysPlayed, weekStart, weekEnd, segmentDisplayName, segmentIcon, color1, color2, siteUrl } = params

  const weekLabel = (() => {
    const s = new Date(weekStart + 'T12:00:00Z')
    const e = new Date(weekEnd + 'T12:00:00Z')
    const fmt = (d: Date) => d.toLocaleDateString('sv-SE', { day: 'numeric', month: 'long', timeZone: 'UTC' })
    return `${fmt(s)} – ${fmt(e)}`
  })()

  return `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>🏆 Du vann veckans quiz!</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800;900&display=swap');

    /* ── Animations (Apple Mail, Thunderbird, Outlook Mac) ── */

    @keyframes spin {
      0%   { transform: rotate(0deg) scale(1); }
      50%  { transform: rotate(180deg) scale(1.3); }
      100% { transform: rotate(360deg) scale(1); }
    }
    @keyframes float {
      0%,100% { transform: translateY(0px); }
      50%      { transform: translateY(-18px); }
    }
    @keyframes pulse-glow {
      0%,100% { opacity: 1; text-shadow: 0 0 20px ${color1}, 0 0 40px ${color2}; }
      50%      { opacity: 0.85; text-shadow: 0 0 40px ${color1}, 0 0 80px ${color2}, 0 0 120px #fff; }
    }
    @keyframes rainbow {
      0%   { color: #ff4e50; }
      16%  { color: #fc913a; }
      33%  { color: #f9d62e; }
      50%  { color: #6dd400; }
      66%  { color: #1fa2ff; }
      83%  { color: #c471ed; }
      100% { color: #ff4e50; }
    }
    @keyframes firework-burst {
      0%   { transform: scale(0) rotate(0deg); opacity: 1; }
      60%  { transform: scale(1.6) rotate(25deg); opacity: 1; }
      100% { transform: scale(2) rotate(40deg); opacity: 0; }
    }
    @keyframes balloon-float {
      0%   { transform: translateY(0) rotate(-5deg); }
      25%  { transform: translateY(-14px) rotate(5deg); }
      50%  { transform: translateY(-8px) rotate(-3deg); }
      75%  { transform: translateY(-20px) rotate(4deg); }
      100% { transform: translateY(0) rotate(-5deg); }
    }
    @keyframes star-twinkle {
      0%,100% { transform: scale(1) rotate(0deg); opacity: 1; }
      50%      { transform: scale(1.5) rotate(30deg); opacity: 0.7; }
    }
    @keyframes slide-in {
      from { transform: translateY(30px); opacity: 0; }
      to   { transform: translateY(0); opacity: 1; }
    }
    @keyframes shimmer {
      0%   { background-position: -200% center; }
      100% { background-position: 200% center; }
    }

    .trophy        { animation: spin 3s ease-in-out infinite; display: inline-block; }
    .balloon-l     { animation: balloon-float 3s ease-in-out infinite; display: inline-block; }
    .balloon-r     { animation: balloon-float 3.5s ease-in-out infinite 0.5s; display: inline-block; }
    .star-1        { animation: star-twinkle 1.5s ease-in-out infinite; display: inline-block; }
    .star-2        { animation: star-twinkle 2s ease-in-out infinite 0.3s; display: inline-block; }
    .star-3        { animation: star-twinkle 1.8s ease-in-out infinite 0.7s; display: inline-block; }
    .fw1           { animation: firework-burst 1.2s ease-out infinite 0s; display: inline-block; }
    .fw2           { animation: firework-burst 1.2s ease-out infinite 0.4s; display: inline-block; }
    .fw3           { animation: firework-burst 1.2s ease-out infinite 0.8s; display: inline-block; }
    .winner-name   { animation: rainbow 2s linear infinite; display: inline-block; }
    .score-shine   { animation: pulse-glow 2s ease-in-out infinite; display: inline-block; }
    .card-in       { animation: slide-in 0.8s ease-out both; }
    .shimmer-text  {
      background: linear-gradient(90deg, ${color1} 0%, #fff 40%, ${color2} 60%, ${color1} 100%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: shimmer 2.5s linear infinite;
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#06000F;font-family:'DM Sans',Arial,sans-serif;">

  <!-- Stars background strip -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#06000F;min-height:100vh;">
    <tr><td align="center" style="padding:32px 16px;">

      <!-- ═══════════ OUTER CARD ═══════════ -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
             style="max-width:580px;background:#110022;border:2px solid;border-color:${color1};border-radius:24px;overflow:hidden;box-shadow:0 0 60px rgba(201,146,42,0.25);">

        <!-- ── RAINBOW TOP BAR ── -->
        <tr>
          <td style="height:6px;background:linear-gradient(90deg,#FF6B6B,#FFD93D,#6BCB77,#4D96FF,#C77DFF,#FF6B6B);font-size:0;line-height:0;">&nbsp;</td>
        </tr>

        <!-- ── FIREWORKS ROW ── -->
        <tr>
          <td style="background:linear-gradient(180deg,#1A0035 0%,#110022 100%);padding:20px 28px 0;text-align:center;">
            <span class="fw1" style="font-size:34px;margin:0 6px;">🎆</span>
            <span class="fw2" style="font-size:40px;margin:0 6px;">🎇</span>
            <span class="fw3" style="font-size:34px;margin:0 6px;">🎆</span>
          </td>
        </tr>

        <!-- ── TROPHY + BALLOONS ── -->
        <tr>
          <td style="padding:10px 28px 0;text-align:center;">
            <span class="balloon-l" style="font-size:42px;">🎈</span>
            <span class="trophy"    style="font-size:72px;margin:0 8px;">🏆</span>
            <span class="balloon-r" style="font-size:42px;">🎈</span>
          </td>
        </tr>

        <!-- ── STARS ── -->
        <tr>
          <td style="padding:8px 28px 0;text-align:center;">
            <span class="star-1" style="font-size:24px;margin:0 8px;color:#FFD700;">★</span>
            <span class="star-2" style="font-size:20px;margin:0 8px;color:#FF69B4;">★</span>
            <span class="star-3" style="font-size:24px;margin:0 8px;color:#00BFFF;">★</span>
          </td>
        </tr>

        <!-- ── HEADLINE ── -->
        <tr>
          <td style="padding:18px 28px 4px;text-align:center;">
            <div style="font-size:13px;letter-spacing:3px;text-transform:uppercase;color:#C077FF;font-weight:700;margin-bottom:8px;">
              🎉 &nbsp;VINNARE&nbsp; 🎉
            </div>
            <h1 style="margin:0;font-size:32px;font-weight:900;line-height:1.2;color:#FFFFFF;">
              GRATTIS&nbsp;
              <span class="shimmer-text" style="font-size:38px;font-weight:900;">GRATTIS GRATTIS!</span>
            </h1>
          </td>
        </tr>

        <!-- ── WINNER NAME BOX ── -->
        <tr>
          <td style="padding:16px 28px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0"
                   style="background:linear-gradient(135deg,#1E003A,#0D002B);border:2px solid;border-color:${color1};border-radius:18px;overflow:hidden;">
              <tr>
                <td style="padding:22px;text-align:center;">
                  <div style="font-size:14px;color:#A0A0C0;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;">Veckans mästare</div>
                  <div class="winner-name" style="font-size:44px;font-weight:900;letter-spacing:1px;color:#FF6B6B;">
                    ${username}
                  </div>
                  <div style="margin-top:8px;">
                    <span style="font-size:20px;margin:0 4px;">🌟</span>
                    <span style="font-size:20px;margin:0 4px;">👑</span>
                    <span style="font-size:20px;margin:0 4px;">🌟</span>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── CONGRATULATIONS TEXT ── -->
        <tr>
          <td style="padding:4px 28px 18px;text-align:center;">
            <p style="margin:0;font-size:18px;font-weight:700;line-height:1.6;color:#E8D5FF;">
              Du har tagit hem veckans utmaning för<br/>
              <span style="font-size:22px;font-weight:900;color:${color1};">
                ${segmentIcon}&nbsp;${segmentDisplayName}
              </span>
            </p>
            <p style="margin:12px 0 0;font-size:14px;color:#7A6A8A;line-height:1.8;">
              ${weekLabel}
            </p>
          </td>
        </tr>

        <!-- ── SCORE STATS ── -->
        <tr>
          <td style="padding:0 28px 22px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <!-- Total score -->
                <td width="50%" style="padding:0 6px 0 0;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0"
                         style="background:linear-gradient(135deg,${color1}22,${color2}22);border:1px solid ${color1}55;border-radius:14px;">
                    <tr>
                      <td style="padding:18px;text-align:center;">
                        <div style="font-size:30px;margin-bottom:4px;">⭐</div>
                        <div class="score-shine" style="font-size:32px;font-weight:900;color:${color1};">${totalScore}</div>
                        <div style="font-size:11px;color:#7A6A8A;text-transform:uppercase;letter-spacing:1px;margin-top:4px;">Totalpoäng</div>
                      </td>
                    </tr>
                  </table>
                </td>
                <!-- Days played -->
                <td width="50%" style="padding:0 0 0 6px;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0"
                         style="background:linear-gradient(135deg,#6C63FF22,#00C9A722);border:1px solid #6C63FF55;border-radius:14px;">
                    <tr>
                      <td style="padding:18px;text-align:center;">
                        <div style="font-size:30px;margin-bottom:4px;">🔥</div>
                        <div style="font-size:32px;font-weight:900;color:#9D8FFF;">${daysPlayed}</div>
                        <div style="font-size:11px;color:#7A6A8A;text-transform:uppercase;letter-spacing:1px;margin-top:4px;">Dagar spelat</div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── HYPE COPY ── -->
        <tr>
          <td style="padding:0 28px 22px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0"
                   style="background:linear-gradient(135deg,#1A0035,#0A001F);border-radius:16px;border:1px solid #3A1A5A;">
              <tr>
                <td style="padding:22px 24px;text-align:center;">
                  <p style="margin:0 0 10px;font-size:28px;">
                    🥇&nbsp;🎊&nbsp;🎉&nbsp;💫&nbsp;🏅
                  </p>
                  <p style="margin:0;font-size:16px;font-weight:700;color:#E8D5FF;line-height:1.8;">
                    Du är den absoluta mästaren denna vecka!<br/>
                    <span style="color:#FFD700;">Du ÄR proffs!</span>
                    &nbsp;🌟 Din insikt, ditt engagemang och din kunskapstörst<br/>
                    har tagit dig till toppen av leaderboardet!
                  </p>
                  <p style="margin:14px 0 0;font-size:15px;color:#B08FD0;line-height:1.7;">
                    🚀 Nu laddar vi för nästa vecka — <strong style="color:#FF69B4;">kan du försvara titeln?</strong><br/>
                    Varje dag räknas. Spela varje dag. Bli legenden! 👑
                  </p>
                  <p style="margin:14px 0 0;font-size:22px;">
                    🎆🎉🏆🎊🎆
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── CTA BUTTON ── -->
        <tr>
          <td style="padding:0 28px 28px;text-align:center;">
            <a href="${siteUrl}"
               style="display:inline-block;padding:18px 52px;background:linear-gradient(135deg,${color1} 0%,${color2} 100%);color:#FFFFFF;text-decoration:none;border-radius:50px;font-size:17px;font-weight:900;font-family:'DM Sans',Arial,sans-serif;letter-spacing:1px;box-shadow:0 6px 30px rgba(201,146,42,0.5);">
              ${segmentIcon}&nbsp;&nbsp;Spela nästa veckas quiz!
            </a>
          </td>
        </tr>

        <!-- ── CONFETTI BOTTOM ── -->
        <tr>
          <td style="padding:0 28px 14px;text-align:center;font-size:26px;letter-spacing:4px;">
            🎈🌟🎊💫🎉🎆🏆🎇🎊🌟🎈
          </td>
        </tr>

        <!-- ── FOOTER ── -->
        <tr>
          <td style="background:#0A0018;padding:18px 28px;border-top:1px solid #2A1A3A;text-align:center;">
            <!-- Rainbow bar -->
            <div style="height:3px;background:linear-gradient(90deg,#FF6B6B,#FFD93D,#6BCB77,#4D96FF,#C77DFF);border-radius:2px;margin-bottom:14px;"></div>
            <p style="margin:0 0 6px;font-size:12px;color:#4A3A5A;font-family:'DM Sans',Arial,sans-serif;">
              Du fick detta mail för att du spelade Quizine Daily denna vecka. 🏆
            </p>
            <p style="margin:0;font-size:12px;font-family:'DM Sans',Arial,sans-serif;">
              <a href="${siteUrl}" style="color:#7A5A9A;text-decoration:none;">Quizine Daily</a>
            </p>
          </td>
        </tr>

      </table>
      <!-- /OUTER CARD -->

    </td></tr>
  </table>
</body>
</html>`
}

// ─── Main handler ─────────────────────────────────────────────────────────────

serve(async () => {
  try {
    const { start, end } = getLastWeekBounds()
    const results: Record<string, { status: string; winner?: string; score?: number }> = {}

    for (const [segmentId, segmentMeta] of Object.entries(SEGMENTS)) {
      // Fetch all scores for this segment this week
      const { data: scores, error: scoresErr } = await supabase
        .from('daily_scores')
        .select('user_id, username, score')
        .eq('segment', segmentId)
        .gte('date', start)
        .lte('date', end)
        .not('user_id', 'is', null)

      if (scoresErr || !scores?.length) {
        results[segmentId] = { status: 'no_scores' }
        continue
      }

      // Aggregate by user_id
      const totals = new Map<string, { username: string; total: number; days: number }>()
      for (const row of scores) {
        const prev = totals.get(row.user_id) ?? { username: row.username, total: 0, days: 0 }
        totals.set(row.user_id, { username: row.username, total: prev.total + row.score, days: prev.days + 1 })
      }

      // Find winner
      let winnerId = ''
      let winnerData = { username: '', total: 0, days: 0 }
      for (const [userId, data] of totals.entries()) {
        if (data.total > winnerData.total) {
          winnerId = userId
          winnerData = data
        }
      }

      if (!winnerId) {
        results[segmentId] = { status: 'no_winner' }
        continue
      }

      // Get winner email
      const { data: userData } = await supabase.auth.admin.getUserById(winnerId)
      const email = userData?.user?.email
      if (!email) {
        results[segmentId] = { status: 'no_email', winner: winnerData.username }
        continue
      }

      // Send email
      const html = winnerEmailHtml({
        username: winnerData.username,
        totalScore: winnerData.total,
        daysPlayed: winnerData.days,
        weekStart: start,
        weekEnd: end,
        segmentDisplayName: segmentMeta.displayName,
        segmentIcon: segmentMeta.icon,
        color1: segmentMeta.color1,
        color2: segmentMeta.color2,
        siteUrl: segmentMeta.siteUrl,
      })

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: email,
          subject: `🏆 GRATTIS ${winnerData.username}! Du vann veckans ${segmentMeta.displayName}-utmaning! 🎉`,
          html,
        }),
      })

      results[segmentId] = {
        status: res.ok ? 'sent' : `error:${res.status}`,
        winner: winnerData.username,
        score: winnerData.total,
      }
    }

    return new Response(JSON.stringify({ week: { start, end }, results }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
