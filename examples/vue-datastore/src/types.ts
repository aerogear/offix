import { Todo } from "./datastore/generated";

export type TodoProps = {
  todo: Todo;
};

export type TodoListProps = {
  todos: Array<Todo>;
};

export type AddTodoProps = {
  cancel: () => void;
};

export type EditTodoProps = {
  todo: Todo;
  toggleEdit: () => void;
};

export type ToggleTodoProps = {
  todo: Todo;
};

export type HookState = {
  data: any | null;
  loading: boolean;
  error: Error | null;
};

export enum ActionType {
  REQ_START = 0,
  REQ_SUCCESS = 1,
  REQ_FAILED = 2
}

export type ReducerAction = {
  type: ActionType;
  payload?: any;
};
