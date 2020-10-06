import React, { useEffect } from 'react';
import { useOfflineMutation } from 'react-offix-hooks';
import { View } from 'react-native';
import { Empty } from './Empty';
import { Todo } from './Todo/Todo';
import { EDIT_TODO, DELETE_TODO } from '../gql/queries';
import { mutateOptions, subscriptionOptions } from '../helpers';

export const TodoList = ({ todos, subscribeToUpdates }) => {
  const [editTodo] = useOfflineMutation(EDIT_TODO, mutateOptions.edit);
  const [deleteTodo] = useOfflineMutation(DELETE_TODO, mutateOptions.remove);

  useEffect(() => {
    subscribeToUpdates(subscriptionOptions.add);
    subscribeToUpdates(subscriptionOptions.edit);
    subscribeToUpdates(subscriptionOptions.remove);
  }, []);

  if (todos.length === 0) return <Empty />;

  return (
    <View>
      {
        // map through todos and render
        // each todo item
        todos && todos.map((todo) => (
          <View key={todo.id}>
            <Todo
              todo={todo}
              editTodo={editTodo}
              deleteTodo={deleteTodo}
              subscribeToUpdates={subscribeToUpdates}
            />
          </View>
        ))
      }
    </View>
  );
};
