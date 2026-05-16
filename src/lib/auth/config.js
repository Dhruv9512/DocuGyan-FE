const DEFAULT_BACKEND_BASE_URL = "http://127.0.0.1:8000";

function normalizeBoolean(value, fallback) {
  if (value === undefined) {
    return fallback;
  }

  return String(value).toLowerCase() === "true";
}

export function getBackendBaseUrl() {
  // If running on the Next.js server (SSR), use the absolute URL based on DEBUG
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_DEBUG === "true" 
      ? "http://localhost:8000" 
      : "https://docugyan-backend.onrender.com";
  }

  // If running in the user's browser, use the proxy route
  const url = process.env.NEXT_PUBLIC_BACKEND_BASE_URL ?? "/api/backend";

  // Prepend origin if it's a relative path to avoid crashes in new URL()
  if (url.startsWith("/")) {
    return window.location.origin + url;
  }

  return url;
}

export function getAuthCookieOptions() {
  const secure = normalizeBoolean(process.env.AUTH_COOKIE_SECURE, process.env.NODE_ENV === "production");
  const sameSite = process.env.AUTH_COOKIE_SAMESITE ?? (secure ? "none" : "lax");

  return {
    secure,
    sameSite,
    httpOnly: true,
    path: "/",
  };
}

export const ACCESS_COOKIE_NAME = "access";
export const REFRESH_COOKIE_NAME = "refresh";
export const ACCESS_COOKIE_MAX_AGE_SECONDS = 30 * 60;
export const REFRESH_COOKIE_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;
