import express from "express";
import authRoutes from "./routes/auth.route";
import postRoutes from "./routes/post.route";
import adminPostRoutes from "./routes/admin.route";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/admin/posts", adminPostRoutes);
export default app;
