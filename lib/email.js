// E-mails transactionnels (Resend). Si RESEND_API_KEY est absent, rien n'est envoyé.
import { Resend } from 'resend'
import { formatPrice, DELIVERY_LABEL } from '@/lib/utils'

const FROM = process.env.EMAIL_FROM || 'Susy Modas <onboarding@resend.dev>'

export function emailEnabled() {
  return !!process.env.RESEND_API_KEY
}

async function send({ to, subject, html }) {
  if (!emailEnabled()) {
    console.warn('[email] RESEND_API_KEY absent, e-mail non envoyé :', subject)
    return false
  }
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({ from: FROM, to, subject, html })
    return true
  } catch (e) {
    console.error('[email]', e.message)
    return false
  }
}

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

function layout(title, body) {
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width"/><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:#F6F1EB;font-family:Arial,Helvetica,sans-serif;color:#1C1917;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 12px;"><tr><td align="center">
<table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;">
<tr><td style="padding:28px 32px;border-bottom:1px solid #EEE7DF;text-align:center;">
<div style="font-family:Georgia,serif;font-size:26px;letter-spacing:.04em;">Susy Modas</div>
<div style="font-size:10px;letter-spacing:.3em;text-transform:uppercase;color:#9C8F84;margin-top:4px;">Mode évangélique · Kourou</div>
</td></tr>
<tr><td style="padding:32px;">${body}</td></tr>
<tr><td style="padding:18px 32px;background:#FBF8F4;font-size:11px;color:#A8998C;text-align:center;">Susy Modas Evangelicas · Kourou, Guyane française</td></tr>
</table></td></tr></table></body></html>`
}

export async function sendVerificationEmail({ to, name, code }) {
  return send({
    to,
    subject: `${code} est votre code Susy Modas`,
    html: layout(
      'Vérification',
      `<p style="font-size:16px;margin:0 0 12px;">Bonjour ${esc(name)},</p>
       <p style="font-size:14px;line-height:1.6;color:#57534E;margin:0 0 24px;">Voici votre code pour activer votre compte :</p>
       <div style="background:#F6F1EB;padding:22px;text-align:center;font-family:Georgia,serif;font-size:34px;letter-spacing:.35em;">${esc(code)}</div>
       <p style="font-size:12px;color:#A8998C;margin:20px 0 0;text-align:center;">Ce code expire dans 15 minutes.</p>`
    ),
  })
}

export async function sendOrderConfirmation(order, settings) {
  const rows = order.items
    .map(
      (i) => `<tr><td style="padding:8px 0;font-size:13px;">${esc(i.productName)}${i.size ? ` · ${esc(i.size)}` : ''} × ${i.quantity}</td>
       <td style="padding:8px 0;font-size:13px;text-align:right;">${formatPrice(i.price * i.quantity)}</td></tr>`
    )
    .join('')
  const pickup = order.deliveryMethod === 'PICKUP'
  return send({
    to: order.email,
    subject: `Commande ${order.reference} confirmée`,
    html: layout(
      'Commande confirmée',
      `<p style="font-size:16px;margin:0 0 8px;">Merci ${esc(order.firstName)} !</p>
       <p style="font-size:14px;line-height:1.6;color:#57534E;margin:0 0 20px;">Votre paiement est bien reçu. Commande <strong>${esc(order.reference)}</strong>.</p>
       <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #EEE7DF;border-bottom:1px solid #EEE7DF;">${rows}</table>
       <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:10px;font-size:13px;">
         <tr><td>${esc(DELIVERY_LABEL[order.deliveryMethod])}</td><td style="text-align:right;">${order.shippingCost ? formatPrice(order.shippingCost) : 'Offert'}</td></tr>
         <tr><td style="padding-top:6px;font-weight:bold;">Total</td><td style="padding-top:6px;text-align:right;font-weight:bold;">${formatPrice(order.totalAmount)}</td></tr>
       </table>
       <p style="font-size:13px;line-height:1.6;color:#57534E;margin:24px 0 0;">${
         pickup
           ? `Nous vous prévenons dès que votre commande est prête. Retrait : ${esc(settings.storeAddress)} (${esc(settings.storeHours)}).`
           : `Livraison à : ${esc(order.address)}, ${esc(order.postalCode)} ${esc(order.city)}. Nous vous prévenons à l'expédition.`
       }</p>`
    ),
  })
}

export async function sendAdminNewOrder(order, adminEmail) {
  return send({
    to: adminEmail,
    subject: `Nouvelle vente : ${order.reference} (${formatPrice(order.totalAmount)})`,
    html: layout(
      'Nouvelle vente',
      `<p style="font-size:15px;margin:0 0 12px;">Nouvelle commande payée.</p>
       <p style="font-size:13px;line-height:1.7;color:#57534E;margin:0;">
       ${esc(order.firstName)} ${esc(order.lastName)} · ${esc(order.phone)}<br/>
       ${esc(DELIVERY_LABEL[order.deliveryMethod])} · ${order.items.length} article(s) · ${formatPrice(order.totalAmount)}</p>`
    ),
  })
}
