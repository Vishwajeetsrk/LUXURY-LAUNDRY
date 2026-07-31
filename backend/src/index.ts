import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import http from "http";
import { Server as SocketIOServer } from "socket.io";

dotenv.config();

import authRoutes from "./routes/auth";
import orderRoutes from "./routes/orders";
import customerRoutes from "./routes/customers";
import serviceRoutes from "./routes/services";
import contactRoutes from "./routes/contact";
import contentRoutes from "./routes/content";
import dashboardRoutes from "./routes/dashboard";
import invoiceRoutes from "./routes/invoices";
import whatsappRoutes from "./routes/whatsapp";
import subscriptionRoutes from "./routes/subscriptions";
import shopProductRoutes from "./routes/shopProducts";
import packageRoutes from "./routes/packages";
import walletRoutes from "./routes/wallet";
import offerRoutes from "./routes/offers";
import settingRoutes from "./routes/settings";
import priceListRoutes from "./routes/priceList";
import reportsRoutes from './routes/reports';
import uploadRoutes from './routes/upload';
import deliveryRoutes from './routes/delivery';
import reviewsRoutes from './routes/reviews';
import logger from "./lib/logger";

const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server and attach Socket.io
const server = http.createServer(app);
export const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  }
});

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Middleware
app.use(helmet());
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
}));
app.use(cors({
  origin: function (origin, callback) {
    callback(null, true);
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static files for uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Health check
app.get("/api/health", async (req, res) => {
  const health: any = {
    status: "ok",
    message: "LuxWash API is running",
    timestamp: new Date().toISOString(),
    env: {
      database: process.env.DATABASE_URL ? "configured" : "MISSING",
      jwtSecret: process.env.JWT_SECRET ? "set" : "auto-generated",
      nodeEnv: process.env.NODE_ENV || "development",
    },
  };

  // Test database connection
  try {
    const { PrismaClient } = await import("@prisma/client");
    const { Pool } = await import("pg");
    const { PrismaPg } = await import("@prisma/adapter-pg");
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000,
    });
    const adapter = new PrismaPg(pool);
    const testPrisma = new PrismaClient({ adapter });
    await testPrisma.$queryRaw`SELECT 1`;
    await testPrisma.$disconnect();
    await pool.end();
    health.database = "connected";
  } catch (dbErr: any) {
    health.database = "error";
    health.databaseError = dbErr?.message || "Unknown database error";
    health.status = "degraded";
  }

  res.json(health);
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/whatsapp", whatsappRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/shop-products", shopProductRoutes);
app.use("/api/packages", packageRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/price-list", priceListRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/reports", reportsRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/reviews', reviewsRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} not found` });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error" });
});

(async () => {
  // Check critical env vars
  if (!process.env.DATABASE_URL) {
    console.error("FATAL: DATABASE_URL is not set. The server will not be able to connect to the database.");
  }
  if (!process.env.JWT_SECRET) {
    console.warn("WARNING: JWT_SECRET is not set. Using auto-generated secret (tokens will not survive restarts).");
  }

  server.listen(PORT, () => {
    console.log(`\n🧺 LuxWash API Server running on http://localhost:${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/api/health`);
    console.log(`   Database: ${process.env.DATABASE_URL ? " configured" : " NOT CONFIGURED"}`);
    console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? " set" : " auto-generated"}`);
    console.log(`   NODE_ENV: ${process.env.NODE_ENV || "development"}\n`);
  });
})();

export default app;
