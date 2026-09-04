const express = require("express");
const router = express.Router();
const {
  getAllFilings,
  getFilingDetail,
  updateFilingStatus,
  sendMessageToClient,
  requestDocuments,
  getAdminStats,
} = require("../controllers/adminController");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

// All admin routes require auth + admin
router.use(protect);
router.use(adminOnly);

router.get("/stats", getAdminStats);
router.get("/filings", getAllFilings);
router.get("/filings/:id", getFilingDetail);
router.put("/filings/:id/status", updateFilingStatus);
router.post("/filings/:id/message", sendMessageToClient);
router.post("/filings/:id/request-docs", requestDocuments);

module.exports = router;
