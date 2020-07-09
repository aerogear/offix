import React from 'react';
import { Button } from 'antd';
import { AutoForm, TextField, LongTextField, SubmitField } from 'uniforms-antd';

import { schema } from '../../config/formSchema';
import { EditTodoProps, ITodo } from '../../types';
import { useEditTodo } from '../../helpers/hooks';

export const EditTodo = ({ todo, toggleEdit }: EditTodoProps) => {
  
  const { editTodo } = useEditTodo();

  const handleUpdate = (todo: ITodo) => {
    editTodo({
      title: todo.title,
      description: todo.description,
    }, (t) => t.id('eq', todo.id))
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
