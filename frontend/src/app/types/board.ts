export interface Board {
  id: string;
  name: string;
  ownerId: string;
  owner: {
    username: string;
    email: string;
  };
}