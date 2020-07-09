import React from 'react';
import { QuickForm, BoolField } from 'uniforms-antd';
import { useOfflineMutation } from 'react-offix-hooks';

import { ToggleTodoProps } from "../../types";
import { schema } from '../../config/formSchema';
import { EDIT_TODO } from '../../gql/queries';
import { mutateOptions } from '../../helpers';

export function ToggleTodo ({ todo }: ToggleTodoProps) {

  const [editTodo] = useOfflineMutation(EDIT_TODO, mutateOptions.edit);

  const handleUpdate = () => {
    editTodo({
      variables: {
        ...todo,
        completed: !todo.completed,
      },
    }).then(res => console.log(res))
    .catch(error => console.log(error));
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