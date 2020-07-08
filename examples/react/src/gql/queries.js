import gql from 'graphql-tag';

export const GET_TODOS = gql`
  query {
    findAllTodos {
      id
      title
      description
      version
      completed
    }
  }
`;

export const ADD_TODO = gql`
  mutation createTodo($description: String, $title: String, $version: Int!, $completed: Boolean){
    createTodo(input: {title: $title, description: $description, version: $version, completed: $completed}) {
      id
      title
      description
      version
      completed
    }
  }
`;

export const EDIT_TODO = gql`
  mutation updateTodo($id: ID!, $description: String, $title: String, $version: Int!, $completed: Boolean){
    updateTodo(input: {id: $id, title: $title, description: $description, version: $version, completed: $completed}) {
      id
      title
      description
      version
      completed
    }
  }
`;

export const DELETE_TODO = gql`
  mutation deleteTodo($id: ID!){
    deleteTodo(input: { id: $id }) {
      id  
    }
  }
`;

export const TODO_ADDED_SUBSCRIPTION = gql`
  subscription newTodo {
    newTodo {
      id
      title
      description
      version
      completed
    }
  }
`;

export const TODO_UPDATED_SUBSCRIPTION = gql`
  subscription updatedTodo {
    updatedTodo {
      id
      title
      description
      version
      completed
    }
  }
`;

export const TODO_DELETED_SUBSCRIPTION = gql`
  subscription deletedTodo {
    deletedTodo {
      id
    }
  }
`;
