require("dotenv").config({ path: __dirname + "/.env" });

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const businessRoutes = require("./routes/businessRoutes");
const filingRoutes = require("./routes/filingRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: ["http://localhost:5173", process.env.CLIENT_URL],
    credentials: true,
  }),
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/business", businessRoutes);
app.use("/api/filings", filingRoutes);

app.get("/", (req, res) => {
  res.json({ message: "CAC Filing API is running! 🚀" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
