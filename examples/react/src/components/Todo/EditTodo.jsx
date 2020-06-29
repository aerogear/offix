import React, { useRef } from 'react'

export const EditTodo = ({ todo, editTodo, toggleEdit }) => {
  const titleRef = useRef()
  const descRef = useRef()

  const getInputs = () => {
    const title =
      titleRef.current.value === '' ? todo.title : titleRef.current.value
    const description =
      descRef.current.value === '' ? todo.description : descRef.current.value
    // return an array of inputs
    return [title, description]
  }

  const clear = () => {
    titleRef.current.value = ''
    descRef.current.value = ''
    toggleEdit()
  }

  const handleUpdate = e => {
    e.preventDefault()

    // get serialized inputs
    const [title, description] = getInputs()

    // execute mutation
    editTodo({
      title,
      description
    }, (t) => t.id("eq", todo.id))

    clear()
  }

  return (
    <div className='columns'>
      <div className='column col-12'>
        <form onSubmit={handleUpdate}>
          <div className='form-group'>
            <label className='form-label' htmlFor='title-edit'>
              Title
            </label>
            <input
              id='title-edit'
              name='title'
              type='text'
              className='form-input'
              ref={titleRef}
              placeholder={todo.title}
            />
          </div>
          <div className='form-group'>
            <label className='form-label' htmlFor='desc-edit'>
              Description
            </label>
            <textarea
              id='desc-edit'
              name='description'
              className='form-input mb-4'
              ref={descRef}
              placeholder={todo.description}
            />
          </div>
          <div className='btn-group float-right'>
            <button
              type='submit'
              className='btn btn-sm btn-primary'
              onClick={handleUpdate}
            >
              Edit
            </button>
            <button
              type='button'
              className='btn btn-sm btn-error'
              onClick={clear}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
