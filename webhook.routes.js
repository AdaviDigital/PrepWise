const router = require("express").Router();
const express = require("express");
const ctrl = require("../controllers/payments.controller");

// express.raw keeps req.body as a Buffer AND we stash it on req.rawBody so
// the HMAC check in paystack.service.js can hash the exact bytes received.
router.post(
  "/paystack/webhook",
  express.raw({ type: "application/json" }),
  (req, res, next) => {
    req.rawBody = req.body;
    try {
      req.body = JSON.parse(req.body.toString("utf8"));
    } catch {
      req.body = {};
    }
    next();
  },
  ctrl.paystackWebhook
);

module.exports = router;
