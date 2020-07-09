import React from 'react';
import { Button } from 'antd';
import { AutoForm, TextField, LongTextField, SubmitField } from 'uniforms-antd';
import { useOfflineMutation } from 'react-offix-hooks';

import { schema } from '../../config/formSchema';
import { EditTodoProps, ITodo } from '../../types';
import { EDIT_TODO } from '../../gql/queries';
import { mutateOptions } from '../../helpers';

export const EditTodo = ({ todo, toggleEdit }: EditTodoProps) => {
  
  const [editTodo] = useOfflineMutation(EDIT_TODO, mutateOptions.edit);

  const handleUpdate = ({ title, description }: ITodo) => {
    editTodo({
      variables: {
        ...todo,
        title,
        description,
      },
    })
    .then(() => toggleEdit())
    .catch((error: any) => {
      console.log(error);
      if (error.offline) {
        toggleEdit();
      }
    });
  };

  return (
    <AutoForm 
      className="ant-form-vertical" 
      schema={schema} 
      model={todo} 
      onSubmit={handleUpdate}
    >
      <TextField name="title" />
      <LongTextField name="description" />
      <Button onClick={toggleEdit} >Cancel</Button>
      <SubmitField style={{ float: 'right' }} />
    </AutoForm>
  );
};
