import React from 'react';

const Todo = ({ todo, editTodo, deleteTodo, toggleEdit }) => {

  const handleUpdate = (e) => {
    e.preventDefault();
    
    // execute mutation
    editTodo({
      variables: {
        ...todo,
        completed: !todo.completed,
      }
    })
  }

  const handleDelete = (e) => {
    e.preventDefault();
    // execute mutation
    deleteTodo({ variables: todo })
  }

  return (
    <div className="columns">
      <div className="column col-6">
        <div className="form-group">
          <label className="form-checkbox">
            <input type="checkbox" checked={todo.completed} onChange={handleUpdate} />
            <i className="form-icon" />
            <span className={ todo.completed ? 'todo-completed' : '' }>{todo.title}</span>
          </label>
        </div>
      </div>
      <div className="column col-6">
        <div className="form-group">
          <div className="btn-group float-right">
            <button className="btn btn-sm btn-primary" onClick={toggleEdit}>
              <i className="icon icon-edit" />
            </button>
            <button className="btn btn-sm btn-error" onClick={handleDelete}>
              <i className="icon icon-delete" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Todo;
