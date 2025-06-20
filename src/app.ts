import express from "express";
import authRoutes from "./routes/auth.route";
import postRoutes from "./routes/post.route";
const app = express();

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
export default app;
