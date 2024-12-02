export interface LoginResponse {
  token: string;
  user: {
    email: string;
    username: string;
  };
}

export interface RegisterResponse {
  message: string;
  user: {
    id: string;
    email: string;
    username: string;
  };
}