export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("accessToken");
}

export function isTokenExpired(token: string) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const exp = payload.exp * 1000; // JWT exp is in seconds
    return Date.now() > exp;
  } catch {
    return true;
  }
}

export function isAuthenticated() {
  const token = getAccessToken();
  if (!token) return false;
  if (isTokenExpired(token)) return false;
  return true;
}
