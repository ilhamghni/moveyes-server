import express from "express";
import { prisma } from "./lib/prisma";
import authRoutes from "./routes/auth.routes";
import movieRoutes from "./routes/movie.routes";
import profileRoutes from "./routes/profile.routes";
import watchHistoryRoutes from "./routes/watchHistory.routes";
import { errorHandler } from "./utils/errorHandler";
import * as dotenv from "dotenv";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/watch-history", watchHistoryRoutes);

// Basic health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({ message: "Moveyes Server is running", status: "OK" });
});

// Error handling middleware
app.use(errorHandler);

// Use Cloud Run's PORT environment variable or fallback to 8080
const PORT = Number(process.env.PORT) || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle graceful shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
