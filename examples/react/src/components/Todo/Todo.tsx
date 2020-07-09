import React, { useState, FormEvent } from 'react';
import { useOfflineMutation } from 'react-offix-hooks';
import { Row, Col, Button } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

import { EditTodo, ToggleTodo } from '../forms';
import { TodoProps } from '../../types';
import { DELETE_TODO } from '../../gql/queries';
import { mutateOptions } from '../../helpers';

export const Todo = ({ todo }: TodoProps) => {
  const [edit, setEdit] = useState<boolean>(false);
  const [deleteTodo] = useOfflineMutation(DELETE_TODO, mutateOptions.remove);

  const handleDelete = (e: FormEvent) => {
    e.preventDefault();
    deleteTodo({ 
      variables: {
        ...todo
      } 
    }).then(res => console.log(res))
    .catch(error => console.log(error));
  };
  
  if (edit) {
    return (
      <EditTodo
        todo={todo}
        toggleEdit={() => setEdit(!edit)}
      />
    );
  }

  return (
    <Row justify="space-between">
        <Col>
          <ToggleTodo todo={todo} />
          <p>
            <b>Description: </b><br/>
            {todo.description}
          </p>
        </Col>
        <Col>
          <Button type="primary" onClick={() => setEdit(true)}>
            <EditOutlined />
          </Button>
          <Button type="primary" onClick={handleDelete} danger>
            <DeleteOutlined />
          </Button>
        </Col>
      </Row>
  );
};
