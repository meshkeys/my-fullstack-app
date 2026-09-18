const express = require("express");
const router = express.Router();
const {
  createBusiness,
  getMyBusinesses,
  getBusinessById,
  updateBusiness,
  getDashboardStats,
} = require("../controllers/businessController");
const { protect } = require("../middleware/authMiddleware");
const { upload } = require("../middleware/uploadMiddleware");

// All routes are protected
router.use(protect);

router.get("/stats", getDashboardStats);
router.post("/", upload.single("cacCertificate"), createBusiness);
router.get("/", getMyBusinesses);
router.get("/:id", getBusinessById);
router.put("/:id", updateBusiness);

module.exports = router;
