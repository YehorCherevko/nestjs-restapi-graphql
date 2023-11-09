import * as dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGO_URI || "",
  secretKey: process.env.SECRET_KEY || "",
};
