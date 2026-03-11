import { jwtDecode } from "jwt-decode";

type DecodedToken = {
  exp?: number;
  id?: string;
  username?: string;
  atUsername?: string;
};

export const isTokenExpired = (token?: string | null) => {
  if (!token) return true;

  try {
    const decoded = jwtDecode<DecodedToken>(token);

    if (!decoded.exp) return true;

    const now = Math.floor(Date.now() / 1000);

    return decoded.exp <= now;
  } catch {
    return true;
  }
};