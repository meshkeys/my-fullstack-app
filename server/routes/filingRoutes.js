const express = require("express");
const router = express.Router();
const {
  getFilingTypes,
  createFiling,
  getMyFilings,
  getFilingById,
} = require("../controllers/filingController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/types", getFilingTypes);
router.post("/", createFiling);
router.get("/", getMyFilings);
router.get("/:id", getFilingById);

module.exports = router;
