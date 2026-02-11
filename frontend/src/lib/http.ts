import axios from "axios";
import { API_BASE } from "../config";

export const http = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

let accessToken: string | null = null;

export function setAccessToken(t: string | null) {
  accessToken = t;
}

http.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

http.interceptors.response.use(
  (r) => r,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original.__isRetry) {
      original.__isRetry = true;
      try {
        const r = await http.post("/auth/refresh");
        setAccessToken(r.data.accessToken);
        return http(original);
      } catch {
        setAccessToken(null);
      }
    }
    return Promise.reject(err);
  }
);
