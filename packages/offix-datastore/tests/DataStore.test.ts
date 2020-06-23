/**
 * @jest-environment jsdom
 */

import "fake-indexeddb/auto";

import {
    DataStore
} from "../src/DataStore";
import { createDefaultStorage } from "../src/storage/adapters/defaultStorage";
import { Model } from "../src/Model";

const DB_NAME = "offix-datastore";

function getIndexedDB() {
    return new Promise<IDBDatabase>((resolve, reject) => {
        const request = window.indexedDB.open(DB_NAME, 1);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
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
    const dataStore = new DataStore(DB_NAME);
    NoteModel = dataStore.create<Note>("user_Note", {
        id: "string",
        title: "string",
        description: "string"
    });
    dataStore.create<Comment>("user_Comment", {
        id: "string",
        title: "string",
        noteId: "string"
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

test("Store Schema update", async () => {
    const idbStorage = createDefaultStorage(DB_NAME, [ "user_Test" ], 2);
    const db = await idbStorage.getIndexedDBInstance();
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
    const savedNote = (await NoteModel.save(note) as any);
    const results = (await NoteModel.query((p: any) => p.title("eq", note.title)) as any);
    expect(results[0]).toHaveProperty("id", savedNote.id);
});

test("Update single entity in local store", async () => {
    const note = { title: "test", description: "description" };
    const savedNote = (await NoteModel.save(note) as any);
    savedNote.title = "update note";
    await NoteModel.update(savedNote);
    const updatedNote = (await NoteModel.query((p: any) => p.id("eq", savedNote.id)) as any[])[0];
    expect(updatedNote.title).toEqual(savedNote.title);
});

test("Remove single entity from local store", async () => {
    const note = { title: "test", description: "description" };
    const savedNote = (await NoteModel.save(note) as any);
    await NoteModel.remove();
    const results = (await NoteModel.query((p: any) => p.id("eq", savedNote.id)) as any[]);
    expect(results.length).toEqual(0);
});

test("Remove all entities matching predicate from local store", async () => {
    const note = { title: "test", description: "description" };
    const savedNote = (await NoteModel.save(note) as any);
    const predicate = (p: any) => p.id("eq", savedNote.id);
    await NoteModel.remove(predicate);
    const results = (await NoteModel.query(predicate) as any[]);
    expect(results.length).toEqual(0);
});

test("Observe local store events", async () => {
    const note = { title: "test", description: "description" };
    expect.assertions(2);

    NoteModel.on("ADD", (event) => {
        expect(event.eventType).toEqual("ADD");
        expect(event.data.title).toEqual(note.title);
    });
    await NoteModel.save(note);
});

test.todo("Sync with server");
