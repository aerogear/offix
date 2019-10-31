import { gql } from "@aerogear/voyager-server";
import { conflictHandler } from "offix-server-conflicts";
import { PubSub } from "graphql-subscriptions";
import fs from "fs";

const pubSub = new PubSub();

const typeDefs = gql`
type Task {
  id: ID!
  version: Int
  title: String!
  description: String!
  author: String
}

type Query {
  allTasks(first: Int, after: String): [Task]
  getTask(id: ID!): Task
  findTaskByTitle(title: String!): Task
  uploads: [File]
}

type Mutation {
  createTask(title: String!, description: String!, author: String): Task
  updateTask(id: ID!, title: String, description: String, version: Int!, author: String): Task
  deleteTask(id: ID!): ID
  singleUpload(file: Upload!): File!
}

type Subscription {
  taskCreated: Task
}

type File {
  filename: String!
  mimetype: String!
  encoding: String!
}
`;

let id = 0;
let data = [];
let files = [];

const resetData = () => {
  id = 0;
  data = [];
  files = [];
};

const resolvers = {
  Query: {
    allTasks: () => {
      return data;
    },
    getTask: (_, args) => {
      return data.find(item => item.id === args.id);
    },
    findTaskByTitle: (_, args) => {
      return data.find(item => item.title === args.title);
    },
    uploads: () => {
      return files;
    }
  },

  Mutation: {
    createTask: (_, args) => {
      const newTask = { ...args, id: (id++).toString(), version: 1 };
      data.push(newTask);
      pubSub.publish("taskCreated", {
        taskCreated: newTask
      });
      return newTask;
    },
    updateTask: async (_, args) => {
      const index = data.findIndex(item => item.id === args.id);

      const conflict = conflictHandler.checkForConflict(data[index], args);
      if (conflict) {
        throw conflict;
      }
      data[index] = {...(data[index]), ...args};
      return data[index];
    },
    deleteTask: (_, args) => {
      const index = data.findIndex(item => item.id === args.id);
      data.splice(index, 1);
      return args.id;
    },
    singleUpload: async (_, { file }) => {
      const { stream, filename, mimetype, encoding } = await file;
      // Save file and return required metadata
      const writeStream = fs.createWriteStream(filename);
      stream.pipe(writeStream);
      const fileRecord = {
        filename,
        mimetype,
        encoding
      };
      files.push(fileRecord);
      return fileRecord;
    }
  },
  Subscription: {
    taskCreated: {
      subscribe: () => pubSub.asyncIterator("taskCreated")
    }
  }
};

export {
  typeDefs,
  resolvers,
  resetData
};
