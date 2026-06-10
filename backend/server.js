require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { getDb } = require("./db");
const prescriptionRoutes = require("./routes/prescriptions");

const app = express();
app.use(cors());
app.use(express.json());

let dbReady = false;
getDb()
  .then(() => { dbReady = true; console.log("Database ready"); })
  .catch((err) => { console.error("Failed to initialize DB:", err); process.exit(1); });

app.use((req, res, next) => {
  if (!dbReady) return res.status(503).json({ error: "Database initializing, please retry" });
  next();
});

app.use("/api/prescriptions", prescriptionRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Pharmacy API running on http://localhost:${PORT}`);
});
