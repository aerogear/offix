import React from 'react';
import { View, Text, Button } from 'react-native';

export const TodoContent = ({ todo, editTodo, deleteTodo, toggleEdit }) => {
  const handleUpdate = (e) => {
    e.preventDefault();

    // execute mutation
    editTodo({
      variables: {
        ...todo,
        completed: !todo.completed,
      },
    });
  };

  const handleDelete = (e) => {
    e.preventDefault();
    // execute mutation
    deleteTodo({ variables: todo });
  };

  return (
    <View>
      <View>
        {/* <label className="form-checkbox">
          <input type="checkbox" checked={todo.completed} onChange={handleUpdate} />
          <i className="form-icon" />
          <span className={todo.completed ? 'todo-completed' : ''}>{todo.title}</span>
        </label> */}
        <Text>{todo.title}</Text>
        <Text>Status: {todo.completed ? 'Completed' : 'Pending'}</Text>
      </View>
      <View>
        <Button title="Edit" onPress={toggleEdit} />
        <Button title="Delete" onPress={handleDelete} />
      </View>
    </View>
  );
};
