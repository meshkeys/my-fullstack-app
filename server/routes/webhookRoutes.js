const express = require("express");
const router = express.Router();
const { paystackWebhook } = require("../controllers/paymentController");

// Paystack signature verification needs the raw request body, so this route
// must be mounted before the global express.json() body parser in index.js.
router.post(
  "/paystack",
  express.raw({ type: "application/json" }),
  paystackWebhook,
);

module.exports = router;
