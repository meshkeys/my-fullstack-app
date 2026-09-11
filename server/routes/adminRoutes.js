const express = require("express");
const router = express.Router();
const {
  getAllFilings,
  getFilingDetail,
  updateFilingStatus,
  sendMessageToClient,
  requestDocuments,
  getAdminStats,
  getPrices,
  updatePrice,
  getAgents,
  createAgent,
  updateAgent,
  assignFiling,
  autoAssignFilings,
  getSLAConfigs,
  updateSLAConfig,
  getSettings,
  updateSetting,
  getAgentPerformance,
  deleteAgent,
} = require("../controllers/adminController");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

router.use(protect);
router.use(adminOnly);

router.get("/stats", getAdminStats);
router.get("/filings", getAllFilings);
router.get("/filings/:id", getFilingDetail);
router.put("/filings/:id/status", updateFilingStatus);
router.post("/filings/:id/message", sendMessageToClient);
router.post("/filings/:id/request-docs", requestDocuments);
router.put("/filings/:id/assign", assignFiling);
router.post("/filings/auto-assign", autoAssignFilings);
router.get("/prices", getPrices);
router.put("/prices/:filingType", updatePrice);
router.get("/agents", getAgents);
router.post("/agents", createAgent);
router.put("/agents/:id", updateAgent);
router.get("/agents/:id/performance", getAgentPerformance);
router.get("/sla", getSLAConfigs);
router.put("/sla/:filingType", updateSLAConfig);
router.get("/settings", getSettings);
router.put("/settings/:key", updateSetting);
router.delete("/agents/:id", deleteAgent);

module.exports = router;
