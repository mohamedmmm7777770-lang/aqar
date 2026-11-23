import dotenv from "dotenv";
dotenv.config();

const envKeys = process.env.OPENROUTER_API_KEYS
  ? process.env.OPENROUTER_API_KEYS.split(",").map((k) => k.trim()).filter(Boolean)
  : (process.env.OPENROUTER_API_KEY ? [process.env.OPENROUTER_API_KEY.trim()] : []);

export const openRouterKeys: string[] = envKeys;
