import { useQuery, useSave, useUpdate, useRemove } from 'offix-datastore';
import { TodoModel } from '../datasync/config';
import { Predicate } from "offix-datastore/types/predicates";
import { ITodo } from '../types';

export const useFindTodos = (predicate?: Predicate<unknown>) => useQuery(TodoModel, predicate);

export const useAddTodo = () => useSave(TodoModel);

export const useEditTodo = () => useUpdate<ITodo>(TodoModel);

export const useDeleteTodo = () => useRemove<ITodo>(TodoModel);
