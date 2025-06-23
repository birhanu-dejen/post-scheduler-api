import mongoose from "mongoose";
import app from "./app";
import { config } from "./config";
import { startAgenda } from "./jobs/agenda";

mongoose
  .connect(config.mongoUri)
  .then(() => {
    app.listen(config.port, () => {
      console.log(`🚀 Server running on port ${config.port}`);
    });

    startAgenda();
    console.log("✅ Agenda started");
  })
  .catch((err) => {
    console.error("❌ DB connection error:", err);
  });
