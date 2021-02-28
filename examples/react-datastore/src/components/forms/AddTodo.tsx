import { Button } from "antd";
import React from "react";
import { AutoForm, LongTextField, SubmitField, TextField } from "uniforms-antd";
import { Todo } from "../../datastore/generated";
import { useAddTodo } from "../../datastore/hooks";
import { AddTodoProps } from "../../types";
import { schema } from "./formSchema";

export const AddTodo = ({ cancel }: AddTodoProps) => {
  const { save: addTodo, data, loading, error } = useAddTodo();

  const handleSubmit = ({ title, description }: Todo) => {
    addTodo({
      title,
      description,
      completed: false,
    })
      .then(() => {
        console.log({ data, loading, error });

        cancel();
      })
      .catch((error: any) => console.log(error));
  };

  return (
    <AutoForm
      className="ant-form-vertical"
      schema={schema}
      onSubmit={handleSubmit}
    >
      <TextField name="title" />
      <LongTextField name="description" />
      <Button onClick={cancel}>Cancel</Button>
      <SubmitField style={{ float: "right" }} />
    </AutoForm>
  );
};
