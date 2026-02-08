const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const db = require("./config/mongoose-connection");

const app = express();

/* ========================
   MIDDLEWARES
======================== */

app.use(express.json());
app.use(cookieParser());

/* ========================
   CORS CONFIGURATION
   - Web (Admin + Deployed)
   - Mobile (Expo / iOS / Android)
======================== */

const allowedOrigins = [
  "http://localhost:5173",          // Admin (Vite)
  "https://gramvartha.vercel.app",  // Deployed Admin
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow mobile apps & tools (no origin)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  })
);

/* ========================
   ROUTES
======================== */

app.use("/admin", require("./routes/adminRoutes"));
app.use("/officials", require("./routes/officialsRoutes"));
app.use("/notice", require("./routes/noticeRoutes"));
app.use("/citizen", require("./routes/citizenRoutes"));

/* ========================
   HEALTH CHECK
======================== */

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "GramVartha Backend Running",
  });
});

/* ========================
   ERROR HANDLER
======================== */

app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

/* ========================
   SERVER START
======================== */

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
