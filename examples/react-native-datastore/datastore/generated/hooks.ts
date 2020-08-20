import { Filter, useQuery, useSave, useUpdate, useRemove } from 'offix-datastore';
import { TodoModel } from '../config';
import { ITodo } from './types';

export const useFindTodos = (filter?: Filter<ITodo>) => useQuery(TodoModel, filter);

export const useAddTodo = () => useSave(TodoModel);

export const useEditTodo = () => useUpdate<ITodo>(TodoModel);

export const useDeleteTodo = () => useRemove<ITodo>(TodoModel);
