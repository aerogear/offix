/**
 * @jest-environment jsdom
 */

import "isomorphic-unfetch";
import "fake-indexeddb/auto";
import { ApolloServer } from "apollo-server";
import { readFileSync } from "fs";

import { DataStore } from "../src/DataStore";
import { Model } from "../src/Model";
import { Predicate } from "../src/predicates";
import { CRUDEvents } from "../src/storage";
import { IndexedDBStorageAdapter } from "../src/storage/adapters/IndexedDBStorageAdapter";
import { NetworkStatus } from "../src/utils/NetworkStatus";

const DB_NAME = "offix-datastore";
const schema = JSON.parse(readFileSync(`${__dirname}/schema.json`).toString());

function getIndexedDB() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      db.onversionchange = () => {
        db.close();
      };
      resolve(db);
    };
  });
}

interface Note {
  id?: string;
  title: string;
  description: string;
}

interface Comment {
  id?: string;
  title: string;
  noteId: string;
}

let NoteModel: Model<Note>;

beforeEach(() => {
  const dataStore = new DataStore({
    dbName: DB_NAME,
    clientConfig: {
      url: "http://localhost:4000/",
      networkStatus: {} as NetworkStatus
    }
  });
  NoteModel = dataStore.createModel<Note>({
    name: "Note",
    type: "object",
    properties: schema.Note
  });
  dataStore.createModel<Comment>({
    name: "Comment",
    type: "object",
    properties: schema.Comment
  });
  dataStore.init();
});

afterEach(async () => {
  await new Promise((resolve, reject) => {
    const del = indexedDB.deleteDatabase(DB_NAME);
    del.onsuccess = event => resolve();
    del.onblocked = event => resolve();
  });
});

test("Setup client db with provided models", async () => {
  const db = await getIndexedDB();
  expect(db.objectStoreNames).toContain("user_Note");
  expect(db.objectStoreNames).toContain("user_Comment");
  db.close();
});

test.skip("Store Schema update", async () => {
  const idbStorage = new IndexedDBStorageAdapter();
  idbStorage.addStore({ name: "user_Test" });
  idbStorage.createStores(DB_NAME, 2);
  const db = (await idbStorage.getIndexedDBInstance() as IDBDatabase);
  expect(db.objectStoreNames).toContain("user_Test");
  expect(db.objectStoreNames).not.toContain("user_Note");
  expect(db.objectStoreNames).not.toContain("user_Comment");
});

test("Save Note to local store", async () => {
  const note = { title: "test", description: "description" };
  const savedNote = await NoteModel.save(note);
  expect(savedNote.id).toBeDefined();
  expect(savedNote.title).toBe(note.title);
});

test("Query from local store", async () => {
  const note = { title: "test", description: "description" };
  const savedNote = await NoteModel.save(note);
  const results = (await NoteModel.query((p) => p.title("eq", note.title)));
  expect(results[0]).toHaveProperty("id", savedNote.id);
});

test("Update single entity in local store", async () => {
  const note = { title: "test", description: "description" };
  const savedNote = await NoteModel.save(note);
  const newTitle = "updated note";

  await NoteModel.update({
    ...savedNote,
    title: newTitle
  }, (p) => p.id("eq", savedNote.id));

  const updatedNote = (await NoteModel.query((p) => p.id("eq", savedNote.id)))[0];

  expect(updatedNote.title).toEqual(newTitle);
});

test("Remove single entity from local store", async () => {
  const note = { title: "test", description: "description" };
  const savedNote = await NoteModel.save(note);
  await NoteModel.remove();
  const results = (await NoteModel.query((p) => p.id("eq", savedNote.id)));
  expect(results.length).toEqual(0);
});

test("Remove all entities matching predicate from local store", async () => {
  const note = { title: "test", description: "description" };
  const savedNote = await NoteModel.save(note);
  const predicate: Predicate<Note> = (p) => p.id("eq", savedNote.id);
  await NoteModel.remove(predicate);
  const results = (await NoteModel.query(predicate));
  expect(results.length).toEqual(0);
});

test("Observe local store events", async () => {
  const note = { title: "test", description: "description" };
  expect.assertions(3);

  NoteModel.on(CRUDEvents.ADD, (event) => {
    expect(event.eventType).toEqual(CRUDEvents.ADD);
    expect(event.data.title).toEqual(note.title);
  });
  NoteModel.on(CRUDEvents.UPDATE, (event) => {
    expect(event.eventType).toEqual(CRUDEvents.UPDATE);
  });

  await NoteModel.save(note);
  await NoteModel.update({ title: "changed" }, (p) => p.title("eq", "test"));
});


const typeDefs = `
  type Note {
    id: ID
    title: String
    description: String
  }

  input CreateNoteInput {
    id: ID
    title: String
    description: String
  }

  type Query {
    dummy: String
  }

  type Mutation {
    createNote(input: CreateNoteInput!): Note
  }
`;


test("Push local change to server", (done) => {
  const note: Note = {
    title: "test",
    description: "test"
  };
  const server = new ApolloServer({
    typeDefs,
    resolvers: {
      Mutation: {
        createNote: (_, { input }) => {
          expect(input).toHaveProperty("title", note.title);
          expect(input).toHaveProperty("description", note.description);
          server.stop().finally(() => done());
        }
      }
    }
  });
  server.listen();
  NoteModel.save(note);
});

test.skip("Subscribe to changes from server", (done) => {
  const note: Note = {
    title: "test",
    description: "test"
  };
  const server = new ApolloServer({
    typeDefs,
    resolvers: {
      Mutation: {
        // eslint-disable-next-line
        createNote: (_, { input }) => {}
      }
    }
  });
  server.listen();
  NoteModel.save(note);
});
