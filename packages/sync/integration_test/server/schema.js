const { gql } = require('apollo-server')
const { makeExecutableSchema } = require('graphql-tools')
const { conflictHandler, strategies } = require('@aerogear/voyager-conflicts')
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
  updateTaskConflictReject(id: ID!, title: String, description: String, version: Int!): Task
  updateTaskClientResolution(id: ID!, title: String, description: String, version: Int!): Task
  updateTaskCustomClientResolution(id: ID!, title: String, description: String, version: Int!): Task
  updateTaskServerResolution(id: ID!, title: String, description: String, version: Int!): Task
  updateTaskCustomStrategy(id: ID!, title: String, description: String, version: Int!): Task
  deleteTask(id: ID!): ID
  onlineOnly(id: ID!): ID
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
    updateTask: async (_, args) => {
      console.log('update: ', args);
      const index = data.findIndex(item => item.id === args.id);

      if (args.conflictResolution) {
        if (conflictHandler.hasConflict(data[index], args)) {
          if (args.conflictResolution === 'resolveOnClient') {
            const { response } = conflictHandler.resolveOnClient(data[index], args)
            return response
          } else if (args.conflictResolution === 'resolveOnServer') {
            const { resolvedState, response } = await conflictHandler.resolveOnServer(strategies.clientWins, data[index], args)
            data[index] = {...(data[index]), ...resolvedState};
            return response;
          } else if (args.conflictResolution === 'reject') {
            return conflictHandler.reject(data[index], args);
          }
        }
        conflictHandler.nextState(args)
      }
  
      data[index] = {...(data[index]), ...args};
      pubSub.publish(EVENTS.TASK.MODIFIED, {
        taskModified: data[index]
      });
      return data[index];
    },
    updateTaskConflictReject: async (_, args) => {
      console.log('update: ', args);
      const index = data.findIndex(item => item.id === args.id);

      if (conflictHandler.hasConflict(data[index], args)) {
        return conflictHandler.reject(data[index], args);
      }
      conflictHandler.nextState(args)
  
      data[index] = {...(data[index]), ...args};
      pubSub.publish(EVENTS.TASK.MODIFIED, {
        taskModified: data[index]
      });
      return data[index];
    },
    updateTaskClientResolution: async (_, args) => {
      console.log('update: ', args);
      const index = data.findIndex(item => item.id === args.id);

      if (conflictHandler.hasConflict(data[index], args)) {
        const { response } = conflictHandler.resolveOnClient(data[index], args)
        return response
      }
      conflictHandler.nextState(args)
  
      data[index] = {...(data[index]), ...args};
      pubSub.publish(EVENTS.TASK.MODIFIED, {
        taskModified: data[index]
      });
      return data[index];
    },
    updateTaskCustomClientResolution: async (_, args) => {
      console.log('update: ', args);
      const index = data.findIndex(item => item.id === args.id);

      if (conflictHandler.hasConflict(data[index], args)) {
        const { response } = conflictHandler.resolveOnClient(data[index], args)
        return response
      }
      conflictHandler.nextState(args)
  
      data[index] = {...(data[index]), ...args};
      pubSub.publish(EVENTS.TASK.MODIFIED, {
        taskModified: data[index]
      });
      return data[index];
    },
    updateTaskServerResolution: async (_, args) => {
      console.log('update: ', args);
      const index = data.findIndex(item => item.id === args.id);

      if (conflictHandler.hasConflict(data[index], args)) {
        const { resolvedState, response } = await conflictHandler.resolveOnServer(strategies.clientWins, data[index], args)
        data[index] = {...(data[index]), ...resolvedState};
        return response;
      }
      conflictHandler.nextState(args)
  
      data[index] = {...(data[index]), ...args};
      pubSub.publish(EVENTS.TASK.MODIFIED, {
        taskModified: data[index]
      });
      return data[index];
    },
    updateTaskCustomStrategy: async (_, args) => {
      console.log('update: ', args);
      const index = data.findIndex(item => item.id === args.id);

      function customResolutionStrategy(serverState, clientState) {
        return {
          ...serverState,
          ...clientState,
          title: `${serverState.title} ${clientState.title}`
        }
      }

      if (conflictHandler.hasConflict(data[index], args)) {
        const { resolvedState, response } = await conflictHandler.resolveOnServer(customResolutionStrategy, data[index], args)
        data[index] = {...(data[index]), ...resolvedState};
        return response;
      }
      conflictHandler.nextState(args)
  
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
