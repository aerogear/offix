import React, { useEffect } from 'react';
import { useOfflineMutation } from 'react-offix-hooks';
import { Empty } from './Empty';
import { Todo } from './Todo/Todo';
import { EDIT_TODO, DELETE_TODO } from '../gql/queries';
import * as mutateOptions from '../helpers/mutateOptions';
import * as subscriptionOptions from '../helpers/subscriptionOptions';

export const TodoList = ({ todos, subscribeToMore }) => {
  const [editTodo] = useOfflineMutation(EDIT_TODO, mutateOptions.edit);
  const [deleteTodo] = useOfflineMutation(DELETE_TODO, mutateOptions.remove);

  useEffect(() => {
    subscribeToMore(subscriptionOptions.add);
    subscribeToMore(subscriptionOptions.edit);
    subscribeToMore(subscriptionOptions.remove);
  }, []);

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
                  subscribeToMore={subscribeToMore}
                />
              </div>
            </div>
          </div>
        ))
      }
    </>
  );
};
