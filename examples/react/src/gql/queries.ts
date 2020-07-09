import gql from 'graphql-tag';
import { DocumentNode } from 'graphql';

export const GET_TODOS: DocumentNode = gql`
  query {
    findAllTodos {
      id
      title
      description
      completed
    }
  }
`;

export const ADD_TODO: DocumentNode = gql`
  mutation createTodo($description: String, $title: String, $completed: Boolean){
    createTodo(input: {title: $title, description: $description, completed: $completed}) {
      id
      title
      description
      completed
    }
  }
`;

export const EDIT_TODO: DocumentNode = gql`
  mutation updateTodo($id: ID!, $description: String, $title: String, $completed: Boolean){
    updateTodo(input: {id: $id, title: $title, description: $description, completed: $completed}) {
      id
      title
      description
      completed
    }
  }
`;

export const DELETE_TODO: DocumentNode = gql`
  mutation deleteTodo($id: ID!){
    deleteTodo(input: { id: $id }) {
      id  
    }
  }
`;

export const TODO_ADDED_SUBSCRIPTION: DocumentNode = gql`
  subscription newTodo {
    newTodo {
      id
      title
      description
      completed
    }
  }
`;

export const TODO_UPDATED_SUBSCRIPTION: DocumentNode = gql`
  subscription updatedTodo {
    updatedTodo {
      id
      title
      description
      completed
    }
  }
`;

export const TODO_DELETED_SUBSCRIPTION: DocumentNode = gql`
  subscription deletedTodo {
    deletedTodo {
      id
    }
  }
`;
