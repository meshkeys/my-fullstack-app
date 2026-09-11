const express = require("express");
const router = express.Router();
const {
  getAgentStats,
  getAgentFilings,
  claimFiling,
} = require("../controllers/agentController");
const { protect } = require("../middleware/authMiddleware");

const agentOnly = (req, res, next) => {
  if (!req.user.isAgent && !req.user.isAdmin) {
    return res
      .status(403)
      .json({ success: false, message: "Agent access only" });
  }
  next();
};

router.use(protect);
router.use(agentOnly);

router.get("/stats", getAgentStats);
router.get("/filings", getAgentFilings);
router.post("/filings/:id/claim", claimFiling);

module.exports = router;
