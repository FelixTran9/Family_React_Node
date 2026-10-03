// URL của Backend. Local: http://localhost:5002 ; Production: đặt VITE_API_URL trên Vercel
export const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5002").replace(/\/$/, "");
