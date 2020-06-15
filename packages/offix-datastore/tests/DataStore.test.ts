/**
 * @jest-environment jsdom
 */

import "fake-indexeddb/auto";

import {
    configure,
    observe,
    remove,
    save,
    query,
    update
} from "../src/DataStore";
import { createDefaultStorage } from "../src/storage/adapters/defaultStorage";

function getIndexedDB() {
    return new Promise<IDBDatabase>((resolve, reject) => {
        const request = window.indexedDB.open("offix-datastore", 1);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
}

beforeEach(() => {
    configure(`${__dirname}/mock.graphql`);
});

afterEach(async () => {
    await new Promise((resolve, reject) => {
        indexedDB.deleteDatabase("offix-datastore").onsuccess = event => resolve();
    });
});

test("Setup client db with provided schema", async () => {
    const db = await getIndexedDB();
    expect(db.objectStoreNames).toContain("user_Note");
    expect(db.objectStoreNames).toContain("user_Comment");
    db.close();
});

test("Store Schema update", async () => {
    const idbStorage = createDefaultStorage([ { __typename: "Test" } ], 2);
    const db = await idbStorage.indexedDB;
    expect(db.objectStoreNames).toContain("user_Test");
    expect(db.objectStoreNames).not.toContain("user_Note");
    expect(db.objectStoreNames).not.toContain("user_Comment");
});

test("Save Note to local store", async () => {
    const note = { title: "test", description: "description", __typename: "Note" };
    const savedNote = (await save(note) as any);
    expect(savedNote.id).toBeDefined();
    expect(savedNote.title).toBe(note.title);
});

test("Query from local store", async () => {
    const note = { title: "test", description: "description", __typename: "Note" };
    const savedNote = (await save(note) as any);
    const results = (await query(savedNote, (p: any) => p.title("eq", note.title)) as any);
    expect(results[0]).toHaveProperty("id", savedNote.id);
});

test("Update single entity in local store", async () => {
    const note = { title: "test", description: "description", __typename: "Note" };
    const savedNote = (await save(note) as any);
    savedNote.title = "update note";
    await update(savedNote);
    const updatedNote = (await query(savedNote, (p: any) => p.id("eq", savedNote.id)) as any[])[0];
    expect(updatedNote.title).toEqual(savedNote.title);
});

test("Remove single entity from local store", async () => {
    const note = { title: "test", description: "description", __typename: "Note" };
    const savedNote = (await save(note) as any);
    await remove(savedNote);
    const results = (await query(savedNote, (p: any) => p.id("eq", savedNote.id)) as any[]);
    expect(results.length).toEqual(0);
});

test("Remove all entities matching predicate from local store", async () => {
    const note = { title: "test", description: "description", __typename: "Note" };
    const savedNote = (await save(note) as any);
    const predicate = (p: any) => p.id("eq", savedNote.id);
    await remove(savedNote, predicate);
    const results = (await query(savedNote, predicate) as any[]);
    expect(results.length).toEqual(0);
});

test("Observe local store events", async () => {
    const note = { title: "test", description: "description", __typename: "Note" };
    expect.assertions(2);

    observe(note, (event) => {
        expect(event.operationType).toEqual("ADD");
        expect(event.data.title).toEqual(note.title);
    });
    await save(note);
});

test.todo("Sync with server");
