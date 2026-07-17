const nodemailer = require("nodemailer");
const env = require("../config/env");
const prisma = require("../config/db");

let transporter = null;
if (env.smtp.host) {
  transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.port === 465,
    auth: { user: env.smtp.user, pass: env.smtp.pass },
  });
}

async function sendEmail({ to, subject, html }) {
  if (!transporter) {
    console.log(`[email:dev] To: ${to} | Subject: ${subject}`);
    return { simulated: true };
  }
  return transporter.sendMail({ from: env.smtp.from, to, subject, html });
}

/** Termii (popular Nigerian SMS/WhatsApp aggregator) — swap provider here if needed. */
async function sendSms({ to, message }) {
  if (!env.termii.apiKey) {
    console.log(`[sms:dev] To: ${to} | Message: ${message}`);
    return { simulated: true };
  }
  const res = await fetch("https://api.ng.termii.com/api/sms/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      to,
      from: env.termii.senderId,
      sms: message,
      type: "plain",
      channel: "generic",
      api_key: env.termii.apiKey,
    }),
  });
  return res.json();
}

async function sendWhatsApp({ to, message }) {
  if (!env.whatsapp.accessToken) {
    console.log(`[whatsapp:dev] To: ${to} | Message: ${message}`);
    return { simulated: true };
  }
  const res = await fetch(
    `https://graph.facebook.com/v19.0/${env.whatsapp.phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.whatsapp.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: message },
      }),
    }
  );
  return res.json();
}

/** Persists an in-app notification and best-effort delivers it on the requested channel. */
async function notify({ userId, channel, title, body, to }) {
  const notification = await prisma.notification.create({
    data: { userId, channel, title, body },
  });

  try {
    if (channel === "EMAIL" && to) await sendEmail({ to, subject: title, html: `<p>${body}</p>` });
    if (channel === "SMS" && to) await sendSms({ to, message: `${title}: ${body}` });
    if (channel === "WHATSAPP" && to) await sendWhatsApp({ to, message: `${title}: ${body}` });
    await prisma.notification.update({ where: { id: notification.id }, data: { sentAt: new Date() } });
  } catch (err) {
    console.error("[notify] delivery failed:", err.message);
  }

  return notification;
}

module.exports = { sendEmail, sendSms, sendWhatsApp, notify };
