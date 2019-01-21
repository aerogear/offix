import { ApolloLink } from 'apollo-link';

const testLink = {
  link: new ApolloLink((operation, forward) => {
    testLink.counter++;
    return forward(operation);
  }),
  counter: 0
};

export default testLink;