const axios = require("axios");
const crypto = require("crypto");
const prisma = require("../prisma/client");
const { sendFilingConfirmationEmail } = require("../utils/emailService");

const PAYSTACK_BASE = "https://api.paystack.co";

// Marks a filing as paid and sends the confirmation email. Idempotent —
// safe to call from both the redirect-back verify flow and the webhook
// without double-processing (e.g. sending two confirmation emails).
const markFilingAsPaid = async (paymentReference) => {
  const filing = await prisma.filing.findUnique({
    where: { paymentReference },
    include: { business: { include: { user: true } } },
  });

  if (!filing) return null;
  if (filing.paymentStatus === "PAID") return filing;

  const updated = await prisma.filing.update({
    where: { id: filing.id },
    data: {
      paymentStatus: "PAID",
      paidAt: new Date(),
      status: "PENDING",
    },
  });

  try {
    await sendFilingConfirmationEmail(
      filing.business.user.email,
      filing.business.user.fullName,
      filing.filingType,
      filing.business.businessName,
    );
  } catch (emailError) {
    console.error(
      "Payment confirmation email error:",
      emailError.message,
    );
  }

  return updated;
};

// @desc    Start a Paystack transaction for a filing
// @route   POST /api/filings/:id/pay
const initializePayment = async (req, res) => {
  try {
    if (!process.env.PAYSTACK_SECRET_KEY) {
      return res.status(500).json({
        success: false,
        message: "Payments are not configured yet. Please contact support.",
      });
    }

    const filing = await prisma.filing.findFirst({
      where: { id: req.params.id, business: { userId: req.user.id } },
    });

    if (!filing) {
      return res.status(404).json({
        success: false,
        message: "Filing not found",
      });
    }

    if (filing.paymentStatus === "PAID") {
      return res.status(400).json({
        success: false,
        message: "This filing has already been paid for.",
      });
    }

    // Reuse the existing reference on retry so we don't orphan the old one
    const reference = filing.paymentReference || `FIL-${filing.id}-${Date.now()}`;

    const paystackRes = await axios.post(
      `${PAYSTACK_BASE}/transaction/initialize`,
      {
        email: req.user.email,
        amount: Math.round((filing.amount || 0) * 100), // kobo
        reference,
        callback_url: `${process.env.CLIENT_URL}/payment/callback`,
        metadata: { filingId: filing.id },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      },
    );

    if (!filing.paymentReference) {
      await prisma.filing.update({
        where: { id: filing.id },
        data: { paymentReference: reference },
      });
    }

    res.status(200).json({
      success: true,
      authorizationUrl: paystackRes.data.data.authorization_url,
      reference,
    });
  } catch (error) {
    console.error(
      "Initialize payment error:",
      error.response?.data || error.message,
    );
    res.status(500).json({
      success: false,
      message: "Could not start payment. Please try again.",
    });
  }
};

// @desc    Confirm a payment when the client returns from Paystack
// @route   GET /api/filings/verify-payment/:reference
const verifyPayment = async (req, res) => {
  try {
    if (!process.env.PAYSTACK_SECRET_KEY) {
      return res.status(500).json({
        success: false,
        message: "Payments are not configured yet.",
      });
    }

    const { reference } = req.params;

    const filing = await prisma.filing.findFirst({
      where: { paymentReference: reference, business: { userId: req.user.id } },
    });

    if (!filing) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found",
      });
    }

    if (filing.paymentStatus === "PAID") {
      return res.status(200).json({ success: true, status: "success", filing });
    }

    const verifyRes = await axios.get(
      `${PAYSTACK_BASE}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      },
    );

    if (verifyRes.data.data.status === "success") {
      const updated = await markFilingAsPaid(reference);
      return res
        .status(200)
        .json({ success: true, status: "success", filing: updated });
    }

    res
      .status(200)
      .json({ success: true, status: verifyRes.data.data.status, filing });
  } catch (error) {
    console.error(
      "Verify payment error:",
      error.response?.data || error.message,
    );
    res.status(500).json({
      success: false,
      message: "Could not verify payment.",
    });
  }
};

// @desc    Paystack server-to-server webhook — durable backup in case the
//          client never completes the redirect back (closed tab, etc.)
// @route   POST /api/webhooks/paystack
const paystackWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-paystack-signature"];
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY || "")
      .update(req.body) // raw Buffer, see routes/webhookRoutes.js
      .digest("hex");

    if (!signature || hash !== signature) {
      return res.status(401).send("Invalid signature");
    }

    const event = JSON.parse(req.body.toString("utf8"));

    if (event.event === "charge.success") {
      await markFilingAsPaid(event.data.reference);
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Paystack webhook error:", error.message);
    res.sendStatus(500);
  }
};

module.exports = { initializePayment, verifyPayment, paystackWebhook };
