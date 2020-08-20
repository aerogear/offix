import React from 'react';
import { Button } from 'antd';
import { AutoForm, TextField, LongTextField, SubmitField } from 'uniforms-antd';

import { schema } from './formSchema';
import { EditTodoProps } from '../../types';
import { useEditTodo } from '../../datastore/hooks';
import { Todo } from '../../datastore/generated';

export const EditTodo = ({ todo, toggleEdit }: EditTodoProps) => {

  const { update: editTodo } = useEditTodo();

  const handleUpdate = (todo: Todo) => {
    editTodo({
      ...todo,
      title: todo.title,
      description: todo.description,
    })
    .then(() => toggleEdit())
    .catch((error: any) => {
      console.log(error);
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
