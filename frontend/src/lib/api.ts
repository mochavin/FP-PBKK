import Cookies from "js-cookie";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function loginUser(credentials: {
  email: string;
  password: string;
}) {
  const endpoint = `${BASE_URL}/auth/login`;
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
  const endpoint = `${BASE_URL}/auth/register`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  if (!res.ok) throw new Error("Registration failed");
  return res.json();
}

export const fetcher = async (url: string) => {
  const token = Cookies.get("token");
  const res = await fetch(`${BASE_URL}${url}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch boards");
  }

  return res.json();
};

export const updateCardBoardPosition = async (
  boardId: string,
  listId: string,
  cardId: string,
  position: number
) => {
  const res = await fetch(
    `${BASE_URL}/board/${boardId}/lists/${listId}/cards/${cardId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${Cookies.get("token")}`,
      },
      body: JSON.stringify({
        position: position,
      }),
    }
  );
  if (!res.ok) throw new Error("Failed to update card position");
};

export const createList = async (
  boardId: string,
  listName: string,
  position: number
) => {
  const res = await fetch(`${BASE_URL}/board/${boardId}/lists`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${Cookies.get("token")}`,
    },
    body: JSON.stringify({
      name: listName,
      position: position,
    }),
  });
  if (!res.ok) throw new Error("Failed to create list");
};

export const createCard = async (
  boardId: string,
  listId: string,
  card: { title: string; description: string; position: number }
) => {
  const res = await fetch(`${BASE_URL}/board/${boardId}/lists/${listId}/cards`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${Cookies.get("token")}`,
    },
    body: JSON.stringify(card),
  });
  if (!res.ok) throw new Error("Failed to create card");
  return res.json();
};

export const deleteCard = async (
  boardId: string, 
  listId: string, 
  cardId: string
) => {
  const res = await fetch(
    `${BASE_URL}/board/${boardId}/lists/${listId}/cards/${cardId}`,
    {
      method: "DELETE",
      headers: {
        authorization: `Bearer ${Cookies.get("token")}`,
      },
    }
  );
  if (!res.ok) throw new Error("Failed to delete card");
};

export const deleteList = async (boardId: string, listId: string) => {
  const res = await fetch(
    `${BASE_URL}/board/${boardId}/lists/${listId}`,
    {
      method: "DELETE",
      headers: {
        authorization: `Bearer ${Cookies.get("token")}`,
      },
    }
  );
  if (!res.ok) throw new Error("Failed to delete list");
};