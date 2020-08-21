import React, { useEffect } from 'react';
// import { useOfflineMutation } from 'react-offix-hooks';
import { View } from 'react-native';
import { Empty } from './Empty';
import { Todo } from './Todo/Todo';
import { ITodo } from '../datastore/generated/types';

export const TodoList = ({ todos }: { todos:  Array<ITodo> }) => {
  if (!todos || todos.length === 0) return <Empty />;

  return (
    <View>
      {
        // map through todos and render
        // each todo item
        todos && todos.map((todo: any, index) => (
          <View key={index}>
            <Todo
              todo={todo}
              editTodo={() => console.log("edit")}
            />
          </View>
        ))
      }
    </View>
  );
};
