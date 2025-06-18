import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_LOCAL || "",
  jwtSecret: process.env.JWT_SECRET || "devsecret",
  emailUser: process.env.EMAIL_USER,
  emailPass: process.env.EMAIL_PASS,
};
