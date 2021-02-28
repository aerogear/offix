import { Filter, useQuery, useSave, useUpdate, useRemove } from 'offix-datastore';
import { TodoModel } from './config';
import { Todo } from './generated';

export const useFindTodos = (filter?: Filter<Todo>) => useQuery(TodoModel, filter);

export const useAddTodo = () => useSave(TodoModel);

export const useEditTodo = () => useUpdate<Todo>(TodoModel);

export const useDeleteTodo = () => useRemove<Todo>(TodoModel);
