/**
 * @jest-environment jsdom
 */

import "fake-indexeddb/auto";

import { DataStore } from "../src/DataStore";
import { createDefaultStorage } from "../src/storage/adapters/defaultStorage";
import { Model } from "../src/Model";
import { Predicate } from "../src/predicates";

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
        id: {
            type: "ID",
            key: "id"
        },
        title: {
            type: "String",
            key: "title"
        },
        description: {
            type: "String",
            key: "description"
        }
    });
    dataStore.create<Comment>("user_Comment", {
        id: {
            type: "ID",
            key: "id"
        },
        title: {
            type: "String",
            key: "title"
        },
        noteId: {
            type: "ID",
            key: "noteId"
        }
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
    expect.assertions(2);

    NoteModel.on("ADD", (event) => {
        expect(event.eventType).toEqual("ADD");
        expect(event.data.title).toEqual(note.title);
    });
    await NoteModel.save(note);
});

test.todo("Sync with server");
