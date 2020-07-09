import React from 'react';
import { Card } from 'antd';

import { Empty } from '../UI';
import { Todo } from './Todo';
import { TodoListProps } from '../../types';

export const TodoList = ({ todos }: TodoListProps) => {

  if (todos.length === 0) return <Empty />;

  return (
    // map through todos and render
    // each todo item
    <>
      {
        todos && todos.map((todo) => (
          <Card key={todo.id} style={{ margin: ' 0.5em 0' }}>
            <Todo
              todo={todo}
            />
          </Card>
        ))
      }
    </>
  );
};
