import React from 'react';
import { Button } from 'antd';
import { 
  AutoForm, 
  TextField, 
  LongTextField, 
  HiddenField, 
  SubmitField 
} from 'uniforms-antd';

import { AddTodoProps, ITodo } from '../../types';
import { schema } from '../../config/formSchema';
import { useAddTodo } from '../../helpers/hooks';

export const AddTodo = ({ cancel }: AddTodoProps) => {

  const { addTodo } = useAddTodo();

  const handleSubmit = ({ title, description, completed }: ITodo) => {
    addTodo({
      title,
      description,
      completed,
    })
    .then(() => cancel())
    .catch((error: any) => console.log(error));
  };

  return (
    <AutoForm className='ant-form-vertical' schema={schema} onSubmit={handleSubmit}>
      <TextField name="title" />
      <LongTextField name="description" />
      <HiddenField name="completed" value={false} />
      <Button onClick={cancel}>Cancel</Button>
      <SubmitField style={{ float: 'right' }} />
    </AutoForm>
  );
};
