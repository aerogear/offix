import { CacheOperation } from 'offix-cache';
import { GET_TODOS } from '../gql/queries';

const options = {
  updateQuery: GET_TODOS,
  returnType: 'Todo',
}

export const add = {
  ...options,
  operationType: CacheOperation.ADD,
};

export const edit = {
  ...options,
  operationType: CacheOperation.REFRESH,
};

export const remove = {
  ...options,
  operationType: CacheOperation.DELETE,
};
