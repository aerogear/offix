import React, { useState } from 'react';
import { View, Button, TextInput } from 'react-native';

export const EditTodo = ({ todo, editTodo, toggleEdit }) => {
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description);

  const validate = () => {
    const t = title || todo.title;
    const d = description || todo.description;
    // return an array of inputs
    return [t, d];
  };

  const handleUpdate = (e) => {
    e.preventDefault();

    // get serialized inputs
    const [t, d] = validate();

    // execute mutation
    editTodo({
      variables: {
        ...todo,
        title: t,
        description: d,
      },
    }).then(toggleEdit)
    .catch(handleError);
  };

  const handleError = (error) => {
    if (error.offline) {
      error.watchOfflineChange();
    } else {
      console.log(error);
    }
    toggleEdit;
  }

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
      {/* <div className="form-group">
        <label className="form-label" htmlFor="title-edit">Title</label>
        <input id="title-edit" name="title" type="text" className="form-input"  />
      </div> */}
      {/* <div className="form-group">
        <label className="form-label" htmlFor="desc-edit">Description</label>
        <textarea id="desc-edit" name="description" className="form-input mb-4" ref={descRef} placeholder={todo.description} />
      </div> */}
      <View>
        <Button title="Edit" onPress={handleUpdate} />
        <Button title="Cancel" onPress={toggleEdit} />
      </View>
    </View>
  );
};
