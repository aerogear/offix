import { Button } from "antd";
import React from "react";
import { AutoForm, LongTextField, SubmitField, TextField } from "uniforms-antd";
import { Todo } from "../../datastore/generated";
import { useEditTodo } from "../../datastore/hooks";
import { EditTodoProps } from "../../types";
import { schema } from "./formSchema";

export const EditTodo = ({ todo, toggleEdit }: EditTodoProps) => {
  const { update: editTodo } = useEditTodo();

  const handleUpdate = (todo: Todo) => {
    editTodo({
      ...todo,
      title: todo.title,
      description: todo.description,
      _version: todo._version ?? 1,
    })
      .then(() => {
        toggleEdit();
      })
      .catch((error: any) => {
        console.log(error);
      });
  };

  return (
    <AutoForm
      className="ant-form-vertical"
      schema={schema}
      model={todo}
      onSubmit={handleUpdate}
    >
      <TextField name="title" />
      <LongTextField name="description" />
      <Button onClick={toggleEdit}>Cancel</Button>
      <SubmitField style={{ float: "right" }} />
    </AutoForm>
  );
};
