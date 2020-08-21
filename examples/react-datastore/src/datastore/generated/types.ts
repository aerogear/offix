export interface Todo {
    _id: string;
    title?: string;
    description?: string;
    completed?: boolean
    _version: number;
    _deleted: boolean;
}

export type TodoCreate = Omit<Todo, "_id">;
export type TodoChange =  Pick<Todo, "_id"> & Partial<TodoCreate>;

export interface User {
    _id: string;
    name: string
    _version: number;
    _deleted: boolean;
}

export type UserCreate = Omit<User, "_id">;
export type UserChange =  Pick<User, "_id"> & Partial<UserCreate>;
