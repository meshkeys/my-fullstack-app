const express = require("express");
const router = express.Router();
const {
  getFilingTypes,
  createFiling,
  getMyFilings,
  getFilingById,
  getFilingMessages,
  replyToFiling,
  requestDocuments,
  uploadRequestedDocs,
} = require("../controllers/filingController");
const { protect } = require("../middleware/authMiddleware");
const { upload } = require("../middleware/uploadMiddleware");

router.use(protect);

router.get("/types", getFilingTypes);
router.post("/", createFiling);
router.get("/", getMyFilings);
router.get("/:id", getFilingById);
router.get("/:id/messages", getFilingMessages);
router.post("/:id/messages", replyToFiling);
router.post("/:id/request-docs", requestDocuments);
router.post(
  "/:id/upload-docs",
  upload.array("documents", 10),
  uploadRequestedDocs,
);

module.exports = router;
