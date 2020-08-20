import React, { useState } from 'react';
import { TodoContent } from './TodoContent';
import { EditTodo } from './EditTodo';


export const Todo = ({ todo, editTodo, deleteTodo }) => {
  const [edit, setEdit] = useState(false);
  
  if (edit) {
    return (
      <EditTodo
        todo={todo}
        editTodo={editTodo}
        toggleEdit={() => setEdit(!edit)}
      />
    );
  }

  return (
    <TodoContent
      todo={todo}
      editTodo={editTodo}
      deleteTodo={deleteTodo}
      toggleEdit={() => setEdit(!edit)}
    />
  );
};
