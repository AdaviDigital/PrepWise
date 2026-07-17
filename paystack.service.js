const crypto = require("crypto");
const env = require("../config/env");

const BASE_URL = "https://api.paystack.co";

async function paystackFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${env.paystack.secretKey}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const json = await res.json();
  if (!res.ok || json.status === false) {
    const message = json?.message || "Paystack request failed";
    const error = new Error(message);
    error.status = res.status;
    throw error;
  }
  return json;
}

/** Starts a hosted checkout — returns { authorization_url, reference }. */
async function initializeTransaction({ email, amountKobo, reference, metadata, callbackUrl }) {
  const json = await paystackFetch("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email,
      amount: amountKobo,
      reference,
      metadata,
      callback_url: callbackUrl,
    }),
  });
  return json.data;
}

/** Confirms a transaction server-side before activating a subscription. */
async function verifyTransaction(reference) {
  const json = await paystackFetch(`/transaction/verify/${encodeURIComponent(reference)}`);
  return json.data;
}

/**
 * Paystack signs webhook payloads with an HMAC-SHA512 of the raw request
 * body using your secret key. Always verify this before trusting a webhook —
 * never activate a subscription purely because the frontend says "payment
 * succeeded".
 */
function verifyWebhookSignature(rawBody, signatureHeader) {
  const hash = crypto
    .createHmac("sha512", env.paystack.secretKey || "")
    .update(rawBody)
    .digest("hex");
  return hash === signatureHeader;
}

module.exports = { initializeTransaction, verifyTransaction, verifyWebhookSignature };
