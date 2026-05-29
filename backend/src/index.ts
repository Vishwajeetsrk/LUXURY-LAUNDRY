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
import uploadRoutes from "./routes/upload";
import reportsRoutes from "./routes/reports";
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
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "LuxWash API is running", timestamp: new Date().toISOString() });
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
  server.listen(PORT, () => {
    console.log(`\n🧺 LuxWash API Server running on http://localhost:${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/api/health\n`);
  });
})();

export default app;
