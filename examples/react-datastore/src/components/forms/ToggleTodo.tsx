import React from 'react';
import { QuickForm, BoolField } from 'uniforms-antd';

import { ToggleTodoProps } from "../../types";
import { schema } from './formSchema';
import { useEditTodo } from '../../datastore/hooks';

export function ToggleTodo ({ todo }: ToggleTodoProps) {

  const { update: editTodo } = useEditTodo();

  const handleUpdate = () => {
    editTodo({
      ...todo,
      completed: !todo.completed,
    })
    .then((res: any) => console.log(res))
    .catch((error: any) => console.log(error));
  };

  return(
    <QuickForm schema={schema}>
      <BoolField
        label={todo.title}
        value={todo.completed}
        onChange={handleUpdate}
        name="completed"
      />
    </QuickForm>
  );
}
