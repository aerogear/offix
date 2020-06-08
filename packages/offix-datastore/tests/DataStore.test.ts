/**
 * @jest-environment jsdom
 */

import "fake-indexeddb/auto";

import { configure } from "../src/DataStore";

function getIndexedDB() {
    return new Promise<IDBDatabase>((resolve, reject) => {
        const request = window.indexedDB.open("offix-datastore", 1);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
}

test("Setup client db with provided schema", async () => {
    configure(`${__dirname}/mock.graphql`);

    const db = await getIndexedDB();
    expect(db.objectStoreNames).toContain("user_Note");
    expect(db.objectStoreNames).toContain("user_Comment");
    db.close();
});

