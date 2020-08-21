import React, { useState } from 'react';
import { TodoContent } from './TodoContent';
import { EditTodo } from './EditTodo';
import { ITodo } from '../../datastore/generated/types';

export const Todo = ({ todo }: { todo: ITodo }) => {
  const [edit, setEdit] = useState(false);
  
  if (edit) {
    return (
      <EditTodo
        todo={todo}
        toggleEdit={() => setEdit(!edit)}
      />
    );
  }

  return (
    <TodoContent
      todo={todo}
      toggleEdit={() => setEdit(!edit)}
    />
  );
};
