import gql from "graphql-tag";

export const CREATE_ITEM = gql`
mutation createItem($title: String!){
    createItem(title: $title){
      title
    }
  }
`;
