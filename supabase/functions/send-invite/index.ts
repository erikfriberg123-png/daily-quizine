import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const FROM_EMAIL     = Deno.env.get('FROM_EMAIL')!
const SITE_URL       = Deno.env.get('SITE_URL')!

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
}

function inviteHtml(senderName: string, segmentName: string, segmentUrl: string): string {
  return `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Quizine Daily</title>
</head>
<body style="margin:0;padding:0;background:#030C1A;font-family:'DM Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#030C1A;min-height:100vh;">
    <tr><td align="center" style="padding:32px 16px;">

      <table width="100%" cellpadding="0" cellspacing="0" border="0"
             style="max-width:560px;background:#0D1E35;border:1px solid #2A3A52;border-radius:20px;overflow:hidden;">

        <!-- Gold bar -->
        <tr>
          <td style="background:linear-gradient(135deg,#C9922A 0%,#C0441A 100%);height:4px;font-size:0;line-height:0;">&nbsp;</td>
        </tr>

        <!-- Header -->
        <tr>
          <td style="padding:24px 28px 20px;border-bottom:1px solid #2A3A52;">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="width:40px;height:40px;background:linear-gradient(135deg,#2A6EA6,#1558C0);border-radius:10px;text-align:center;vertical-align:middle;">
                  <span style="font-size:20px;font-weight:900;color:#fff;">Q</span>
                </td>
                <td style="padding-left:12px;">
                  <div style="font-size:17px;font-weight:800;color:#F0E6D3;line-height:1.2;">Quizine Daily</div>
                  <div style="font-size:11px;color:#7A8FA6;letter-spacing:1px;text-transform:uppercase;margin-top:2px;">${segmentName}</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Hero -->
        <tr>
          <td style="padding:36px 28px 24px;text-align:center;">
            <div style="font-size:52px;line-height:1;margin-bottom:16px;">👋</div>
            <h1 style="margin:0 0 12px;font-size:24px;font-weight:900;color:#F0E6D3;line-height:1.3;">
              <strong style="color:#D4A84B;">${senderName}</strong> tror att det här är något för dig!
            </h1>
            <p style="margin:0;font-size:14px;color:#7A8FA6;line-height:1.7;max-width:380px;margin:0 auto;">
              Quizine Daily — tre frågor om <strong style="color:#F0E6D3;">${segmentName.toLowerCase()}</strong> varje vardag.
              Det tar bara någon minut och du tävlar mot kollegor i din bransch.
            </p>
          </td>
        </tr>

        <!-- Bullets -->
        <tr>
          <td style="padding:0 28px 28px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0"
                   style="background:#0A1628;border:1px solid #2A3A52;border-radius:14px;overflow:hidden;">
              <tr>
                <td style="padding:16px 20px;border-bottom:1px solid #2A3A52;">
                  <span style="font-size:18px;">✅</span>
                  <span style="font-size:14px;color:#F0E6D3;font-weight:600;margin-left:10px;">Inget konto krävs — kör igång direkt</span>
                </td>
              </tr>
              <tr>
                <td style="padding:16px 20px;border-bottom:1px solid #2A3A52;">
                  <span style="font-size:18px;">⏱️</span>
                  <span style="font-size:14px;color:#F0E6D3;font-weight:600;margin-left:10px;">Tre frågor, 25 sekunder per fråga</span>
                </td>
              </tr>
              <tr>
                <td style="padding:16px 20px;">
                  <span style="font-size:18px;">🏆</span>
                  <span style="font-size:14px;color:#F0E6D3;font-weight:600;margin-left:10px;">Logga in gratis för att synas på topplistan</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:0 28px 36px;text-align:center;">
            <a href="${segmentUrl}"
               style="display:inline-block;padding:16px 48px;background:linear-gradient(135deg,#C9922A,#C0441A);color:#F0E6D3;text-decoration:none;border-radius:14px;font-size:16px;font-weight:800;letter-spacing:0.5px;box-shadow:0 4px 20px rgba(201,146,42,0.3);">
              🎯 &nbsp;Starta dagens quiz
            </a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 28px;border-top:1px solid #2A3A52;background:#0A1628;text-align:center;">
            <p style="margin:0;font-size:12px;color:#4A5568;line-height:1.6;">
              Du fick detta mail för att ${senderName} spelar Quizine Daily och ville tipsa dig.
              <br />
              <a href="${SITE_URL}" style="color:#7A8FA6;text-decoration:none;">daily.quizine.se</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS })
  }

  try {
    const { senderName, recipientEmail, segmentName, segmentUrl } = await req.json()

    // Basic validation
    if (!recipientEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
      return new Response(JSON.stringify({ error: 'Ogiltig e-postadress.' }), {
        status: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    const sender  = (senderName  || 'En spelkollega').slice(0, 50)
    const segment = (segmentName || 'Quizine Daily').slice(0, 60)
    const url     = segmentUrl || SITE_URL

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: recipientEmail,
        subject: `${sender} tipsar dig om Quizine Daily 🎯`,
        html: inviteHtml(sender, segment, url),
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      return new Response(JSON.stringify({ error: err }), {
        status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200, headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }
})
