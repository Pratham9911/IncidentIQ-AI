// Centralized API Base configuration reading from Next.js environment variables
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
