export interface Board {
  id: string;
  name: string;
  ownerId: string;
  owner: {
    username: string;
    email: string;
  };
  members: Member[];
}

export interface User {
  ID: string;
  Username: string;
  Email: string;
}

export interface Member {
  id: string;
  username: string;
  email: string;
  isMember: boolean;
}

export interface CardinBoard {
  id: string;
  title: string;
  description: string;
  position: number;
}

export interface ListinBoard {
  id: string;
  name: string;
  position: number;
  cards: CardinBoard[];
}

export interface BoardDetail {
  id: string;
  name: string;
  lists: ListinBoard[];
}