import axios from "axios";
import "dotenv/config";
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL + "/api",
  credentials: "include",
});
