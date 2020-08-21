import React, { useState } from 'react';
import { View, Button, TextInput } from 'react-native';
import { TodoModel } from '../../datastore/config';
import { ITodo } from '../../datastore/generated/types';

export const EditTodo = ({ todo, toggleEdit }: { todo: ITodo, toggleEdit: Function }) => {
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description);

  const validate = () => {
    const t = title || todo.title;
    const d = description || todo.description;
    // return an array of inputs
    return [t, d];
  };

  const handleUpdate = () => {

    // get serialized inputs
    const [t, d] = validate();

    const filter = { _id: todo._id };
    // execute mutation
    TodoModel.update({ title: t, description: d}, filter)
    .then(toggleEdit)
    .catch((err: any) => console.log(err, '[update] error occured'));
  };

  return (
    <View>
      <TextInput 
        value={title} 
        placeholder={todo.title}
        onChangeText={text => setTitle(text)}
      />
      <TextInput 
        value={description} 
        placeholder={todo.description}
        onChangeText={text => setDescription(text)}
      />
      <View>
        <Button title="Edit" onPress={handleUpdate} />
        <Button title="Cancel" onPress={() => toggleEdit()} />
      </View>
    </View>
  );
};
