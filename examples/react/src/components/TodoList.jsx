import React from 'react';
import { useEditTodo, useDeleteTodo } from '../hooks';
import { Empty } from './Empty';
import { Todo } from './Todo/Todo';

export const TodoList = ({ todos }) => {
  const { editTodo } = useEditTodo();
  const { deleteTodo } = useDeleteTodo();

  if (todos.length === 0) return <Empty />;

  return (
    <>
      {
        // map through todos and render
        // each todo item
        todos && todos.map((todo) => (
          <div key={todo.id} className="card" style={{ margin: ' 0.5em 1em' }}>
            <div className="card-body">
              <div className="container">
                <Todo
                  todo={todo}
                  editTodo={editTodo}
                  deleteTodo={deleteTodo}
                />
              </div>
            </div>
          </div>
        ))
      }
    </>
  );
};
