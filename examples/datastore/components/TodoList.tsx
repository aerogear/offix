import React, { useEffect } from 'react';
// import { useOfflineMutation } from 'react-offix-hooks';
import { View } from 'react-native';
import { Empty } from './Empty';
import { Todo } from './Todo/Todo';
import { ITodo } from '../datastore/generated/types';
// import { EDIT_TODO, DELETE_TODO } from '../gql/queries';
// import { mutateOptions, subscriptionOptions } from '../helpers';

export const TodoList = ({ todos }: { todos:  Array<ITodo> }) => {
  // const [editTodo] = useOfflineMutation(EDIT_TODO, mutateOptions.edit);
  // const [deleteTodo] = useOfflineMutation(DELETE_TODO, mutateOptions.remove);

  if (!todos || todos.length === 0) return <Empty />;

  return (
    <View>
      {
        // map through todos and render
        // each todo item
        todos && todos.map((todo: any) => (
          <View key={todo.id}>
            <Todo
              todo={todo}
              editTodo={() => console.log("edit")}
              deleteTodo={() => console.log("delete")}
              // subscribeToMore={() => {}}
            />
          </View>
        ))
      }
    </View>
  );
};
