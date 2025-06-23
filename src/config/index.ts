import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || "",
  jwtSignInSecret: process.env.JWT_SECRET_SIGNIN || "devsecretsignin",
  saltRounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 10,
  jwtVerifySecret: process.env.JWT_SECRET_VERIFY || "devsecretverifyemail",
  jwtResetSecret: process.env.JWT_SECRET_RESET || "jwtresetemailtoken",
};
