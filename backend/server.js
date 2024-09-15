import path from "path";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary";
import helmet from "helmet"; // Import helmet

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";
import notificationRoutes from "./routes/notification.route.js";

import connectMongoDB from "./db/connectMongoDB.js";

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

// Security middleware (Helmet) with custom Content Security Policy
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"], // Allow resources only from the same origin
        scriptSrc: ["'self'", "https://vercel.live"], // Allow trusted scripts
        connectSrc: ["'self'", "https://vercel.live"], // Allow connections to the Vercel live server for hot-reloading
        imgSrc: ["'self'", "data:", "blob:", "https://res.cloudinary.com"], // Allow images from Cloudinary
        styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles (if needed)
        fontSrc: ["'self'", "https://fonts.googleapis.com", "https://fonts.gstatic.com"], // Allow external fonts
        objectSrc: ["'none'"], // Block object tags (security measure)
        upgradeInsecureRequests: [], // Force HTTPS on any URL
      },
    },
    crossOriginEmbedderPolicy: false, // Disable COEP if needed for compatibility
  })
);

// Body parsing middleware
app.use(express.json({ limit: "5mb" })); // to parse req.body
app.use(express.urlencoded({ extended: true })); // to parse form data (urlencoded)

app.use(cookieParser()); // Parse cookies

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationRoutes);

// Serve static assets if in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/dist")));

  // Handle any other route by serving the React app's index.html
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
} else {
  // Catch-all route for API requests in development
  app.get("*", (req, res) => {
    res.send("API is running");
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectMongoDB(); // Connect to MongoDB
});
