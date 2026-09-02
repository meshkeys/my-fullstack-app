const express = require("express");
const router = express.Router();
const { searchCAC } = require("../controllers/cacController");

// Public route — no auth needed
router.get("/search", searchCAC);

module.exports = router;
