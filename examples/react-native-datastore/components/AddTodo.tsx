import React, {useState} from 'react';
import {View, Button, TextInput, StyleSheet} from 'react-native';
import { useAddTodo } from '../datastore/generated/hooks';
import { TodoModel } from '../datastore/config';

export const AddTodo = ({ cancel }: any) => {
  const [title, setTitle] = useState<string>();
  const [description, setDescription] = useState<string>();

  const handleSubmit = () => {
    TodoModel.save({
      title,
      description,
      completed: false,
    })
    .then(() => cancel())
    .catch((error: any) => console.log(error));
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Title"
        onChangeText={text => setTitle(text)}
      />
      <TextInput
        placeholder="Description"
        onChangeText={text => setDescription(text)}
      />
      <Button title="Close" onPress={cancel} />
      {/* <i className="icon icon-cross" /> */}
      <Button title="Submit" onPress={handleSubmit} />
      {/* <i className="icon icon-check" /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 75,
    alignItems: 'center',
  },
});
