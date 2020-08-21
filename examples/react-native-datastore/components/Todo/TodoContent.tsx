import React from 'react';
import { View, Text, Button } from 'react-native';
import { TodoModel } from '../../datastore/config';
import { ITodo } from '../../datastore/generated/types';

export const TodoContent = ({ todo, toggleEdit }: { todo: ITodo, toggleEdit: Function}) => {
  
  const handleDelete = () => {
    console.log(todo);
    TodoModel.remove({
      _id: todo._id
    })
      .then(() => console.log('Deleted'))
      .catch((err: any) => console.log('Some error occured', err));
  };

  return (
    <View>
      <View>
        <Text>{todo.title}</Text>
        <Text>Status: {todo.completed ? 'Completed' : 'Pending'}</Text>
      </View>
      <View>
        <Button title="Edit" onPress={() => toggleEdit()} />
        <Button title="Delete" onPress={handleDelete} />
      </View>
    </View>
  );
};
