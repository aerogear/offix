import React, { useRef } from 'react';

const AddTodo = ({ addTodo, cancel }) => {

  const titleRef = useRef();
  const descriptionRef = useRef();

  const handleSubmit = (e) => {
    e.preventDefault();
   
    addTodo({
      variables: {
        title: titleRef.current.value,
        description: descriptionRef.current.value,
        version: 1,
        completed: false,
      }
    });

    close();
    
  };

  const close = () => {
    // clear the form
    titleRef.current.value = '';
    descriptionRef.current.value = '';
    cancel();
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="title"
        className="form-input"
        placeholder="Title"
        ref={titleRef}
      />
      <textarea
        name="description"
        placeholder="Description"
        className="form-input mb-4"
        ref={descriptionRef}
      />
      <button
        type="button"
        className="btn btn-md btn-error btn-circle mt-4 ml-4"
        onClick={close}
      >
        <i className="icon icon-cross"></i>
      </button>
      <button
        type="submit"
        className="btn btn-md btn-primary btn-circle float-right mt-4 mr-4"
      >
        <i className="icon icon-check"></i>
      </button>
    </form>
  );
}

export default AddTodo;
