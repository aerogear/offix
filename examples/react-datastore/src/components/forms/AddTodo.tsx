import React from 'react';
import { Button } from 'antd';
import {
  AutoForm,
  TextField,
  LongTextField,
  SubmitField
} from 'uniforms-antd';

import { AddTodoProps } from '../../types';
import { schema } from './formSchema';
import { useAddTodo } from '../../datastore/generated/hooks';
import { ITodo } from '../../datastore/generated/types';

export const AddTodo = ({ cancel }: AddTodoProps) => {

  const { save: addTodo } = useAddTodo();

  const handleSubmit = ({ title, description }: ITodo) => {
    addTodo({
      title,
      description,
      completed: false,
    })
    .then(() => cancel())
    .catch((error: any) => console.log(error));
  };

  return (
    <AutoForm className='ant-form-vertical' schema={schema} onSubmit={handleSubmit}>
      <TextField name="title" />
      <LongTextField name="description" />
      <Button onClick={cancel}>Cancel</Button>
      <SubmitField style={{ float: 'right' }} />
    </AutoForm>
  );
};
