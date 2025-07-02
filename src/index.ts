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
const PORT = parseInt(process.env.PORT || "8080", 10);
const HOST = "0.0.0.0"; // This is crucial for Cloud Run

const server = app.listen(PORT, HOST, () => {
  console.log(`Server running on ${HOST}:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

// Handle graceful shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(`Received ${signal}. Shutting down gracefully...`);

  server.close(async () => {
    console.log("HTTP server closed.");
    try {
      await prisma.$disconnect();
      console.log("Database connection closed.");
    } catch (error) {
      console.error("Error closing database:", error);
    }
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error(
      "Could not close connections in time, forcefully shutting down"
    );
    process.exit(1);
  }, 10000);
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  gracefulShutdown("uncaughtException");
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  gracefulShutdown("unhandledRejection");
});
