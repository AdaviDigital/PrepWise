const env = require("../config/env");

const BASE_URL = "https://api.flutterwave.com/v3";

async function flwFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${env.flutterwave.secretKey}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const json = await res.json();
  if (!res.ok || json.status === "error") {
    const error = new Error(json?.message || "Flutterwave request failed");
    error.status = res.status;
    throw error;
  }
  return json;
}

async function initializePayment({ email, amountNaira, txRef, redirectUrl, metadata }) {
  const json = await flwFetch("/payments", {
    method: "POST",
    body: JSON.stringify({
      tx_ref: txRef,
      amount: amountNaira,
      currency: "NGN",
      redirect_url: redirectUrl,
      customer: { email },
      meta: metadata,
    }),
  });
  return json.data;
}

async function verifyTransaction(transactionId) {
  const json = await flwFetch(`/transactions/${transactionId}/verify`);
  return json.data;
}

/** Flutterwave webhooks are authenticated via a shared "verif-hash" header
 * that must match the secret hash configured in your dashboard — compare
 * it with a constant-time check against the value you set there. */
function verifyWebhookSecret(receivedHash, configuredSecretHash) {
  return Boolean(receivedHash) && receivedHash === configuredSecretHash;
}

module.exports = { initializePayment, verifyTransaction, verifyWebhookSecret };
