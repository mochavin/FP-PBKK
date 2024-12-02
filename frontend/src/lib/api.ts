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
