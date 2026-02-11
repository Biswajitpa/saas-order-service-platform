import dotenv from "dotenv";
dotenv.config();

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export const env = {
  port: parseInt(process.env.PORT || "4000", 10),
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",

  db: {
    host: required("DB_HOST"),
    port: parseInt(process.env.DB_PORT || "3306", 10),
    user: required("DB_USER"),
    password: required("DB_PASSWORD"),
    database: required("DB_NAME"),
  },

  auth: {
    accessSecret: required("ACCESS_TOKEN_SECRET"),
    refreshSecret: required("REFRESH_TOKEN_SECRET"),
    accessTtlSeconds: parseInt(process.env.ACCESS_TOKEN_TTL_SECONDS || "900", 10),
    refreshTtlDays: parseInt(process.env.REFRESH_TOKEN_TTL_DAYS || "7", 10),
  },

  cookie: {
    secure: (process.env.COOKIE_SECURE || "false") === "true",
  },
};
