/**
 * @jest-environment jsdom
 */

import "fake-indexeddb/auto";

import { configure, save } from "../src/DataStore";

function getIndexedDB() {
    return new Promise<IDBDatabase>((resolve, reject) => {
        const request = window.indexedDB.open("offix-datastore", 1);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
}

function convertToPromise(request: IDBRequest) {
    return new Promise((resolve, reject) => {
        request.onsuccess = (event) => {
            resolve(request.result);
        }

        request.onerror = (event) => {
            reject(request.error);
        }
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

test("Save Note to local store", async () => {
    const note = { title: "test", description: "description", __typename: "Note" };
    const savedNote = (await save(note) as any);
    expect(savedNote.id).toBeDefined();
    expect(savedNote.title).toBe(note.title);
});
