const PRODUCTION_API_URL = "https://luxury-laundry.onrender.com";
const LOCAL_API_URL = "http://localhost:5000";

export function getApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (configured) return configured;

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (
      host === "luxurylaundryjaipur.com" ||
      host === "www.luxurylaundryjaipur.com" ||
      host.endsWith(".vercel.app")
    ) {
      return PRODUCTION_API_URL;
    }
  }

  return LOCAL_API_URL;
}

export function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalizedPath, getApiBaseUrl()).toString();
}

