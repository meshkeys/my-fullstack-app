const express = require("express");
const router = express.Router();
const {
  createBusiness,
  getMyBusinesses,
  getBusinessById,
  updateBusiness,
} = require("../controllers/businessController");
const { protect } = require("../middleware/authMiddleware");

// All routes are protected
router.use(protect);

router.post("/", createBusiness);
router.get("/", getMyBusinesses);
router.get("/:id", getBusinessById);
router.put("/:id", updateBusiness);

module.exports = router;
