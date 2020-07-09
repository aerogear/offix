import React from 'react';
import { Button } from 'antd';
import { 
  AutoForm, 
  TextField, 
  LongTextField, 
  HiddenField, 
  SubmitField 
} from 'uniforms-antd';
import { useOfflineMutation } from 'react-offix-hooks';

import { AddTodoProps, ITodo } from '../../types';
import { schema } from '../../config/formSchema';
import { mutateOptions } from '../../helpers';
import { ADD_TODO } from '../../gql/queries';

export const AddTodo = ({ cancel }: AddTodoProps) => {

  const [addTodo] = useOfflineMutation(ADD_TODO, mutateOptions.add);

  const handleSubmit = ({ title, description, completed }: ITodo) => {
    addTodo({
      variables: {
        title,
        description,
        completed,
      },
    })
    .then(() => cancel())
    .catch((error: any) => {
      console.log(error);
      if (error.offline) {
        cancel();
      }
    });
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
