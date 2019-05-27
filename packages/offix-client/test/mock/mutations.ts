import gql from "graphql-tag";

export const CREATE_ITEM = gql`
mutation createItem($title: String!){
    createItem(title: $title){
      title
    }
  }
`;

export const CREATE_LIST = gql`
mutation createList($title: String!){
    createList(title: $title){
      title
    }
  }
`;

export const DELETE_ITEM = gql`
mutation deleteItem($id: ID!){
    deleteItem(id: $id){
      title
    }
  }
`;

export const DOESNT_EXIST = gql`
mutation somethingFake($id: ID!){
    somethingFake(id: $id){
      title
    }
  }
`;

export const GET_ITEMS = gql`
  query allItems($first: Int) {
    allItems(first: $first) {
      id
      title
    }
}
`;

export const GET_LISTS = gql`
  query allLists($first: Int) {
    allLists(first: $first) {
      id
      title
    }
}
`;

export const GET_NON_EXISTENT = gql`
  query somethingFake($first: Int) {
    somethingFake(first: $first) {
      id
      title
    }
}
`;

export const ITEM_CREATED_SUB = gql`
  subscription itemCreated {
    itemCreated {
      id
      title
    }
}
`;

export const ITEM_DELETED_SUB = gql`
  subscription itemDeleted {
    itemDeleted {
      id
    }
}
`;

export const ITEM_UPDATED_SUB = gql`
  subscription itemUpdated {
    itemUpdated {
      id
      title
    }
}
`;
