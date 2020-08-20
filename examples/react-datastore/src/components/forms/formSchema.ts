import { GraphQLBridge } from 'uniforms-bridge-graphql';
import { buildASTSchema } from 'graphql';
import { loader } from 'graphql.macro';
import { Todo } from '../../datastore/generated';

// import the grapqhl model
const model = loader('../../model/runtime.graphql');

const validator = (model: Todo) => {
  const details = [];

  if (!model.title) {
    details.push({ name: 'title' });
  }

  if (details.length) {
    // eslint-disable-next-line
    throw { details };
  }
};

const data = {
  title: {
    required: true,
    errorMessage: 'Title is required',
  }
}

export const schema = new GraphQLBridge(
  buildASTSchema((model)).getType('Todo'),
  validator,
  data,
);
