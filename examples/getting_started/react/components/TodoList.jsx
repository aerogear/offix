import React, { useState, useEffect } from 'react';
import { useOfflineMutation } from 'react-offix-hooks';
import { CacheOperation } from 'offix-cache';
import Empty from './Empty';
import Todo from './Todo/Index';
import { GET_TODOS, EDIT_TODO, DELETE_TODO } from '../gql/queries';

const TodoList = ({ todos }) => {

  const [initialized, setInitialized] = useState(false);

  useEffect(() => setInitialized(true), []);

  const [editTodo, editState] = useOfflineMutation(EDIT_TODO, {
    updateQuery: GET_TODOS,
    returnType: 'Todo',
    operationType: CacheOperation.REFRESH,
  });

  const [deleteTodo, deleteState] = useOfflineMutation(DELETE_TODO, {
    updateQuery: GET_TODOS,
    returnType: 'Todo',
    operationType: CacheOperation.DELETE,
  });

  // listen for edit mutation state changes
  useEffect(() => {
    if (initialized)
      console.log(editState);
  }, [editState]);

  // listen for deletion mutation state changes
  useEffect(() => {
    if (initialized)
      console.log(deleteState);
  }, [deleteState]);

  if (todos.length === 0) return <Empty />;

  return (
    <>
      {
        // map through todos and render
        // each todo item
        todos && todos.map((todo, key) => (
          <div key={key} className="card" style={{ margin: ' 0.5em 1em' }}>
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


}

export default TodoList;
