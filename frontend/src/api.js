// Vite loads .env locally (npm run dev / a plain build) and .env.production
// automatically when building for production (npm run build), so this always
// points at the right backend without any manual swapping.
export const API_URL = import.meta.env.VITE_API_URL
