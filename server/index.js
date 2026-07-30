require("dotenv").config({ path: __dirname + "/.env" });
console.log("JWT_SECRET:", process.env.JWT_SECRET);
console.log("DB URL:", process.env.DATABASE_URL);

const express = require("express");
const cors = require("cors");
require("dotenv").config();
console.log("JWT_SECRET:", process.env.JWT_SECRET);
console.log("DB URL:", process.env.DATABASE_URL);

const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

//Middleware
app.use(cors());
app.use(express.json());

//Routes
app.use("/api/auth", authRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "CAC Filings API is running" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
