import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
// @deno-types="npm:@types/web-push"
import webpush from 'npm:web-push'

const SUPABASE_URL    = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE    = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const RESEND_API_KEY  = Deno.env.get('RESEND_API_KEY')!
const VAPID_PUBLIC    = Deno.env.get('VAPID_PUBLIC_KEY')!
const VAPID_PRIVATE   = Deno.env.get('VAPID_PRIVATE_KEY')!
const VAPID_SUBJECT   = Deno.env.get('VAPID_SUBJECT')!      // e.g. "mailto:noreply@quizine.se"
const FROM_EMAIL      = Deno.env.get('FROM_EMAIL')!          // e.g. "Quizine <noreply@quizine.se>"
const SITE_URL        = Deno.env.get('SITE_URL')!            // e.g. "https://daily.quizine.se"

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE)

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE)

// ─── Email template ────────────────────────────────────────────────────────────

function emailHtml(siteUrl: string): string {
  const today = new Date().toLocaleDateString('sv-SE', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    timeZone: 'Europe/Stockholm',
  })

  return `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Quizine Daily</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800;900&display=swap');
    body { margin: 0; padding: 0; background: #030C1A; font-family: 'DM Sans', Arial, sans-serif; }
  </style>
</head>
<body style="margin:0;padding:0;background:#030C1A;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#030C1A;min-height:100vh;">
    <tr><td align="center" style="padding:32px 16px;">

      <!-- Card -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
             style="max-width:560px;background:#0D1E35;border:1px solid #2A3A52;border-radius:20px;overflow:hidden;">

        <!-- Top gold bar -->
        <tr>
          <td style="background:linear-gradient(135deg,#C9922A 0%,#C0441A 100%);padding:0;height:4px;font-size:0;line-height:0;">&nbsp;</td>
        </tr>

        <!-- Header -->
        <tr>
          <td style="padding:24px 28px 20px;border-bottom:1px solid #2A3A52;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td>
                  <table cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="width:40px;height:40px;background:linear-gradient(135deg,#2A6EA6 0%,#1558C0 100%);border-radius:10px;text-align:center;vertical-align:middle;">
                        <span style="font-size:20px;font-weight:900;color:#fff;font-family:'DM Sans',Arial,sans-serif;">Q</span>
                      </td>
                      <td style="padding-left:12px;">
                        <div style="font-size:17px;font-weight:800;color:#F0E6D3;font-family:'DM Sans',Arial,sans-serif;line-height:1.2;">Quizine Daily</div>
                        <div style="font-size:11px;color:#7A8FA6;font-family:'DM Sans',Arial,sans-serif;letter-spacing:1px;text-transform:uppercase;margin-top:2px;">Dagens utmaning</div>
                      </td>
                    </tr>
                  </table>
                </td>
                <td align="right">
                  <span style="font-size:11px;color:#7A8FA6;font-family:'DM Sans',Arial,sans-serif;letter-spacing:2px;text-transform:uppercase;">✦ ${today} ✦</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Hero -->
        <tr>
          <td style="padding:36px 28px 28px;text-align:center;">
            <div style="font-size:52px;line-height:1;margin-bottom:16px;">🎯</div>
            <h1 style="margin:0 0 10px;font-size:26px;font-weight:900;color:#F0E6D3;font-family:'DM Sans',Arial,sans-serif;line-height:1.25;">
              Dags att testa<br/>
              <em style="font-style:italic;color:#D4A84B;">dina kunskaper!</em>
            </h1>
            <p style="margin:0;font-size:14px;color:#7A8FA6;font-family:'DM Sans',Arial,sans-serif;line-height:1.7;max-width:360px;margin:0 auto;">
              Dagens quiz är redo för dig — 3 frågor, 25 sekunder per fråga och max 500&nbsp;XP att samla.
            </p>
          </td>
        </tr>

        <!-- Quiz preview card -->
        <tr>
          <td style="padding:0 28px 28px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0"
                   style="background:#0A1628;border:1px solid #2A3A52;border-radius:14px;overflow:hidden;">
              <tr>
                <td style="padding:14px 18px;border-bottom:1px solid #2A3A52;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td>
                        <div style="font-size:14px;font-weight:700;color:#F0E6D3;font-family:'DM Sans',Arial,sans-serif;">Dagens meny</div>
                        <div style="font-size:11px;color:#7A8FA6;font-family:'DM Sans',Arial,sans-serif;text-transform:uppercase;letter-spacing:1px;margin-top:2px;">3 rätter · Max 500 XP</div>
                      </td>
                      <td align="right" style="font-size:22px;">🍽️</td>
                    </tr>
                  </table>
                </td>
              </tr>
              <!-- Timer row -->
              <tr>
                <td style="padding:12px 18px;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="font-size:12px;color:#7A8FA6;font-family:'DM Sans',Arial,sans-serif;white-space:nowrap;padding-right:12px;">⏱ Tid per fråga</td>
                      <td width="100%" style="padding:0 8px;">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td style="height:6px;background:#2A3A52;border-radius:3px;">
                              <table width="83%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                  <td style="height:6px;background:linear-gradient(90deg,#C9922A,#C0441A);border-radius:3px;">&nbsp;</td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                      <td style="font-size:18px;font-weight:900;color:#D4A84B;font-family:'DM Sans',Arial,sans-serif;white-space:nowrap;padding-left:8px;">25s</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- CTA button -->
        <tr>
          <td style="padding:0 28px 36px;text-align:center;">
            <a href="${siteUrl}"
               style="display:inline-block;padding:16px 48px;background:linear-gradient(135deg,#C9922A 0%,#C0441A 100%);color:#F0E6D3;text-decoration:none;border-radius:14px;font-size:16px;font-weight:800;font-family:'DM Sans',Arial,sans-serif;letter-spacing:0.5px;box-shadow:0 4px 20px rgba(201,146,42,0.3);">
              🎮 &nbsp;Starta dagens quiz
            </a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 28px;border-top:1px solid #2A3A52;background:#0A1628;text-align:center;">
            <p style="margin:0 0 6px;font-size:12px;color:#4A5568;font-family:'DM Sans',Arial,sans-serif;">
              Du får detta mail för att du har aktiverat dagliga påminnelser.
            </p>
            <p style="margin:0;font-size:12px;font-family:'DM Sans',Arial,sans-serif;">
              <a href="${siteUrl}" style="color:#7A8FA6;text-decoration:none;">Quizine Daily</a>
              &nbsp;·&nbsp;
              <a href="${siteUrl}?unsubscribe=1" style="color:#7A8FA6;text-decoration:underline;">Avsluta påminnelser</a>
            </p>
          </td>
        </tr>

      </table>
      <!-- /Card -->

    </td></tr>
  </table>
</body>
</html>`
}

// ─── Push payload ─────────────────────────────────────────────────────────────

function pushPayload(siteUrl: string) {
  return JSON.stringify({
    title: 'Quizine Daily 🎯',
    body: 'Dags att testa dina kunskaper! Dagens quiz väntar.',
    url: siteUrl,
  })
}

// ─── Main handler ─────────────────────────────────────────────────────────────

serve(async () => {
  try {
    // ── Email reminders ───────────────────────────────────────────────────────
    const { data: emailUsers, error: emailErr } = await supabase
      .from('profiles')
      .select('id, email_reminders')
      .eq('email_reminders', true)

    if (emailErr) throw emailErr

    const emailResults: { id: string; status: string }[] = []

    for (const profile of emailUsers ?? []) {
      // Get email from auth.users via the admin API
      const { data: userData } = await supabase.auth.admin.getUserById(profile.id)
      const email = userData?.user?.email
      if (!email) continue

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: email,
          subject: '🎯 Dags för dagens quiz — Quizine Daily',
          html: emailHtml(SITE_URL),
        }),
      })

      emailResults.push({ id: profile.id, status: res.ok ? 'sent' : `error:${res.status}` })
    }

    // ── Push notifications ────────────────────────────────────────────────────
    const { data: pushSubs, error: pushErr } = await supabase
      .from('push_subscriptions')
      .select('*')

    if (pushErr) throw pushErr

    const pushResults: { endpoint: string; status: string }[] = []
    const payload = pushPayload(SITE_URL)

    for (const sub of pushSubs ?? []) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        )
        pushResults.push({ endpoint: sub.endpoint, status: 'sent' })
      } catch (err) {
        const status = (err as { statusCode?: number }).statusCode
        // 404/410 = subscription expired, clean it up
        if (status === 404 || status === 410) {
          await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
          pushResults.push({ endpoint: sub.endpoint, status: 'expired:removed' })
        } else {
          pushResults.push({ endpoint: sub.endpoint, status: `error:${status}` })
        }
      }
    }

    return new Response(
      JSON.stringify({ emails: emailResults, push: pushResults }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
