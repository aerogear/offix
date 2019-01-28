const { gql } = require('apollo-server')
const { makeExecutableSchema } = require('graphql-tools')
const { pubSub, EVENTS } = require('./subscriptions')

const typeDefs = gql`
type Task {
  id: ID!
  version: Int
  title: String!
  description: String!
}

type Query {
  allTasks(first: Int, after: String): [Task],
  getTask(id: ID!): Task
}

type Mutation {
  createTask(title: String!, description: String!): Task
  updateTask(id: ID!, title: String, description: String, version: Int!): Task
  deleteTask(id: ID!): ID
  onlineOnly(id: ID!): ID
  noSquash(id: ID!): ID
}

type Subscription {
  taskCreated: Task,
  taskModified: Task,
  taskDeleted: ID
}
`

let id = 0;
let data = [];

const resetData = () => {
  id = 0;
  data = [];
};

const resolvers = {
  Query: {
    allTasks: () => {
      console.log('all: ', data);
      return data;
    },
    getTask: (_, args) => {
      return data.find(item => item.id === args.id);
    }
  },

  Mutation: {
    createTask: (_, args) => {
      console.log('create: ', args);
      const newTask = { ...args, id: (id++).toString(), version: 1 };
      data.push(newTask);
      // TODO context helper for publishing subscriptions in SDK?
      pubSub.publish(EVENTS.TASK.CREATED, {
        taskCreated: newTask,
      });
      return newTask;
    },
    updateTask: (_, args) => {
      console.log('update: ', args);
      const index = data.findIndex(item => item.id === args.id);
      data[index] = {...(data[index]), ...args};
      pubSub.publish(EVENTS.TASK.MODIFIED, {
        taskModified: data[index]
      });
      return data[index];
    },
    deleteTask: (_, args) => {
      console.log('delete: ', args);
      const index = data.findIndex(item => item.id === args.id);
      data.splice(index, 1);
      pubSub.publish(EVENTS.TASK.DELETED, {
        taskDeleted: args.id
      });
      return args.id;
    },
    onlineOnly: (_, args) => {
      console.log('onlineOnly: ', args);
      return args.id;
    },
    noSquash: (_, args) => {
      console.log('noSquash: ', args);
      return args.id;
    }
  },
  // TODO add helper/package to support generating subscription resolvers 
  Subscription: {
    taskCreated: {
      subscribe: () => pubSub.asyncIterator(EVENTS.TASK.CREATED)
    },
    taskDeleted: {
      subscribe: () => pubSub.asyncIterator(EVENTS.TASK.DELETED)
    },
    taskModified: {
      subscribe: () => pubSub.asyncIterator(EVENTS.TASK.MODIFIED)
    },
  },
}

const schema = makeExecutableSchema({ typeDefs, resolvers })

module.exports = {
  schema,
  resetData
}
