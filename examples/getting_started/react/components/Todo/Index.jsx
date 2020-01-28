import React, { useState } from 'react';
import Content from './TodoContent';
import EditTodo from './EditTodo';

const Todo = ({ todo, editTodo, deleteTodo }) => {
  const [edit, setEdit] = useState(false);

  if (edit) return (
    <EditTodo
      todo={todo}
      editTodo={editTodo}
      toggleEdit={() => setEdit(!edit)}
    />
  );

  return (
    <Content
      todo={todo}
      editTodo={editTodo}
      deleteTodo={deleteTodo}
      toggleEdit={() => setEdit(!edit)}
    />
  );

};

export default Todo;
