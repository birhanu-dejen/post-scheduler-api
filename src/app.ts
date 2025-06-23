import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import express from "express";
import authRoutes from "./routes/auth.route";
import postRoutes from "./routes/post.route";
import adminPostRoutes from "./routes/admin.route";
import swagger from "./swagger";

const app = express();

// Security middlewares
app.use(helmet());
app.use(cors());

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting early to protect all routes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

const apiBasePath = "/api";

// Routes
app.use(`${apiBasePath}/auth`, authRoutes);
app.use(`${apiBasePath}/posts`, postRoutes);
app.use(`${apiBasePath}/admin/posts`, adminPostRoutes);

// Swagger docs
app.use("/api-docs", swagger);

// Global error handler last
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
      message: err.message || "Internal Server Error",
    });
  }
);

export default app;
