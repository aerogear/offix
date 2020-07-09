export interface ITodo {
  id?: string,
  title: string,
  description: string,
  completed?: boolean,
};

export interface ITodoModel {
  id: string,
  title: string,
  description: string,
  completed: boolean,
};

export type TodoProps = {
  todo: ITodo,
};

export type TodoListProps = {
  todos: Array<ITodo>,
};

export type AddTodoProps = {
  cancel: () => void,
};

export type EditTodoProps = {
  todo: ITodo,
  toggleEdit: () => void,
};

export type ToggleTodoProps = {
  todo: ITodo,
};

export type HookState = {
  data: any | null,
  loading: boolean,
  error: Error | null,
};

export enum ActionType {
  REQ_START = 0,
  REQ_SUCCESS = 1,
  REQ_FAILED = 2,
};

export type ReducerAction = {
  type: ActionType,
  payload?: any,
}