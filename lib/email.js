import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendVerificationEmail({ to, name, code }) {
  await resend.emails.send({
    from: 'Susy Modas <noreply@susymodas.com>',// ← change avec ton domaine vérifié sur Resend
    to,
    subject: `${code} — Votre code de vérification Susy Modas`,
    html: `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Vérification email</title>
</head>
<body style="margin:0;padding:0;background:#F5F0E8;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F0E8;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          
          <!-- Header doré -->
          <tr>
            <td style="background:#C9A96E;padding:28px 40px;text-align:center;">
              <p style="margin:0;font-family:Georgia,serif;font-size:11px;letter-spacing:0.2em;color:#fff;text-transform:uppercase;opacity:0.85;">Evangelicas · Kourou</p>
              <h1 style="margin:6px 0 0;font-family:Georgia,serif;font-size:26px;color:#fff;font-weight:normal;letter-spacing:0.05em;">Susy Modas</h1>
            </td>
          </tr>

          <!-- Corps -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 8px;font-family:Georgia,serif;font-size:17px;color:#2C2C2C;">
                Bonjour ${name} 👋
              </p>
              <p style="margin:0 0 28px;font-family:Arial,sans-serif;font-size:14px;color:#7A6E63;line-height:1.6;">
                Merci de rejoindre Susy Modas ! Pour activer votre compte, entrez le code ci-dessous sur la page de vérification.
              </p>

              <!-- Code -->
              <div style="background:#F5F0E8;border-radius:12px;padding:24px;text-align:center;margin-bottom:28px;">
                <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:11px;letter-spacing:0.15em;color:#9A8F82;text-transform:uppercase;">Votre code</p>
                <p style="margin:0;font-family:Georgia,serif;font-size:36px;font-weight:bold;color:#C9A96E;letter-spacing:0.3em;">${code}</p>
              </div>

              <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:12px;color:#9A8F82;text-align:center;">
                ⏱ Ce code expire dans <strong>15 minutes</strong>.
              </p>
              <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#9A8F82;text-align:center;">
                Si vous n'avez pas créé de compte, ignorez cet email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#FAF7F2;padding:20px 40px;border-top:1px solid #EDE8DE;text-align:center;">
              <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;color:#B5A99A;">
                © 2025 Susy Modas Evangelicas · Kourou, Guyane Française
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `,
  })
}