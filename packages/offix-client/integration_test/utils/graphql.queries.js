import gql from 'graphql-tag';

export const ADD_TASK = gql`
  mutation createTask($description: String!, $title: String!, $author: String ) {
    createTask(description: $description, title: $title, author: $author) {
      id
      title
      description
      version
      author
    }
  }
`;

export const GET_TASKS = gql`
  query allTasks($first: Int) {
    allTasks(first: $first) {
      id
      title
      description
      version
      author
    }
  }
`;

export const GET_TASK = gql`
  query getTask($id: ID!) {
    getTask(id: $id) {
      id
      title
      description
      version
    }
  }
`

export const FIND_TASK_BY_TITLE = gql`
  query findTaskByTitle($title: String!) {
    findTaskByTitle(title: $title) {
      id
      title
      description
      version
    }
  }
`;

export const DELETE_TASK = gql`
  mutation deleteTask($id: ID!) {
    deleteTask(id: $id)
  }
`;

export const UPDATE_TASK = gql`
  mutation updateTask($description: String, $id: ID!, $title: String, $version: Int!, $author: String) {
    updateTask(description: $description, id: $id, title: $title, version: $version, author: $author) {
      description
      id
      title
      version
      author
    }
  }
`;

export const UPDATE_TASK_CLIENT_RESOLUTION = gql`
  mutation updateTask($description: String, $id: ID!, $title: String, $version: Int!, $author: String) {
    updateTask(description: $description, id: $id, title: $title, version: $version, author: $author) {
      description
      id
      title
      version
      author
    }
  }
`;

export const TASK_CREATED = gql`
  subscription taskCreated {
    taskCreated {
      id
      title
      description
      version
      author
    }
  }
`;

export const UPLOAD_FILE = gql`
mutation singleUpload($file: Upload!) {
  singleUpload(file: $file) {
    filename
    mimetype
    encoding
  }
}
`;

export const UPLOADS = gql`
  query uploads {
    uploads {
      filename
      mimetype
      encoding
    }
  }
`;
