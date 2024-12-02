import Cookies from 'js-cookie';

export async function loginUser(credentials: {
  email: string;
  password: string;
}) {
  const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/auth/login`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  if (!res.ok) throw new Error("Login failed");
  return res.json();
}

export async function registerUser(credentials: {
  username: string;
  email: string;
  password: string;
}) {
  const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/auth/register`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  if (!res.ok) throw new Error("Registration failed");
  return res.json();
}

export const fetcher = async (url: string) => {
  const token = Cookies.get('token');
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}/`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch boards');
  }

  return res.json();
};
