import express from "express";
import auth from "./routes/auth.routes";
const app = express();

app.use(express.json());
app.use("/api/auth", auth);
export default app;
