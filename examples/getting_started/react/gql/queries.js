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
    updateTodo(id: $id, input: {title: $title, description: $description, version: $version, completed: $completed}) {
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
    deleteTodo(id: $id)
  }
`;