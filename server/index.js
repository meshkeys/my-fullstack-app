require("dotenv").config({ path: __dirname + "/.env" });

const express = require("express");
const cors = require("cors");
const cacRoutes = require("./routes/cacRoutes");

const authRoutes = require("./routes/authRoutes");
const businessRoutes = require("./routes/businessRoutes");
const filingRoutes = require("./routes/filingRoutes");
const adminRoutes = require("./routes/adminRoutes");
const agentRoutes = require("./routes/agentRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/business", businessRoutes);
app.use("/api/filings", filingRoutes);
app.use("/api/cac", cacRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/agent", agentRoutes);
app.get("/", (req, res) => {
  res.json({ message: "CAC Filing API is running! 🚀" });
});

app.get("/health", (req, res) => {
  res
    .status(200)
    .json({ status: "alive", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Simple cache
const cache = {};
const CACHE_TTL = 60 * 1000; // 1 minute

app.use((req, res, next) => {
  // Only cache GET requests
  if (req.method !== "GET") return next();

  const key = req.originalUrl;
  const cached = cache[key];

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return res.json(cached.data);
  }

  const originalJson = res.json.bind(res);
  res.json = (data) => {
    cache[key] = { data, timestamp: Date.now() };
    return originalJson(data);
  };

  next();
});
