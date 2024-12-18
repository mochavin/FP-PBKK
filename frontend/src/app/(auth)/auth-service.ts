import Cookies from "js-cookie";
import { LoginResponse, RegisterResponse } from "@/types/auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

async function apiCall<T>(endpoint: string, method: string, body?: any): Promise<T> {
  const res = await fetch(endpoint, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`API call failed: ${res.status} - ${error}`);
  }
  return res.json();
}

export async function loginUser(credentials: {
  email: string;
  password: string;
}): Promise<LoginResponse> {
  const endpoint = `${BASE_URL}/auth/login`;
  return apiCall<LoginResponse>(endpoint, "POST", credentials);
}

export async function registerUser(credentials: {
  username: string;
  email: string;
  password: string;
}): Promise<RegisterResponse> {
  const endpoint = `${BASE_URL}/auth/register`;
  return apiCall<RegisterResponse>(endpoint, "POST", credentials);
}