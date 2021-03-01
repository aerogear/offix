export interface Todo {
  _id: string;
  title?: string;
  description?: string;
  completed?: boolean;
  _version: string;
  _lastUpdatedAt: number
}

export type TodoCreate = Omit<Todo, "_id">;
export type TodoChange =  Pick<Todo, "_id"> & Partial<TodoCreate>;
export interface User {
  _id: string;
  name: string;
  _version: string;
  _lastUpdatedAt: number
}

export type UserCreate = Omit<User, "_id">;
export type UserChange =  Pick<User, "_id"> & Partial<UserCreate>;