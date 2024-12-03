export interface Board {
  id: string;
  name: string;
  ownerId: string;
  owner: {
    username: string;
    email: string;
  };
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