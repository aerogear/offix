export interface ITodo {
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
  subscribeToUpdates: (options: any) => void,
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