import { CacheOperation } from 'offix-cache';
import { GET_TODOS } from '../gql/queries';

export const add = {
  updateQuery: GET_TODOS,
  returnType: 'Todo',
  operationType: CacheOperation.ADD,
};

export const edit = {
  updateQuery: GET_TODOS,
  returnType: 'Todo',
  operationType: CacheOperation.REFRESH,
};

export const remove = {
  updateQuery: GET_TODOS,
  returnType: 'Todo',
  operationType: CacheOperation.DELETE,
};
