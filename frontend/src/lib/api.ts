const DEFAULT_API_URL = "http://localhost:5000";

export function getApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (configured) return configured;
  if (typeof window !== "undefined") return window.location.origin;
  return DEFAULT_API_URL;
}

export function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalizedPath, getApiBaseUrl()).toString();
}

