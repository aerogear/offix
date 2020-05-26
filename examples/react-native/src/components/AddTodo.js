import React, {useState} from 'react';
import {View, Button, TextInput, StyleSheet} from 'react-native';

export const AddTodo = ({addTodo, cancel}) => {
  const [title, setTitle] = useState();
  const [description, setDescription] = useState();

  const handleSubmit = e => {
    e.preventDefault();

    addTodo({
      variables: {
        title,
        description,
        version: 1,
        completed: false,
      },
    })
      .then(cancel)
      .catch(handleError);
  };

  const handleError = error => {
    // if (error.offline) {
    //   error.watchOfflineChange();
    // } else {
    //   console.log(error);
    // }
    console.log(error);
    cancel();
  };

  return (
    <View style={styles.container}>
      <TextInput
        type="text"
        name="title"
        placeholder="Title"
        onChangeText={text => setTitle(text)}
      />
      <TextInput
        name="description"
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
