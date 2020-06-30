/**
 * @jest-environment jsdom
 */

import "fake-indexeddb/auto";

import { ReplicationEngine, IReplicationAPI } from "../src/replication";
import { Storage } from "../src/storage";

const DB_NAME = "offix-datastore";

test("Push modified data to server", (done) => {
    const api: IReplicationAPI = {
        push: async (event) => {
            expect(event.eventType).toEqual("ADD");
            expect(event.data).toHaveProperty("title", "test");
            done();
            return {
                data: null,
                errors: [],
            }
        }
    };

    const storage = new Storage(DB_NAME, ["user_Note"], 1);
    const engine = new ReplicationEngine(api, storage);
    engine.start();
    storage.save("user_Note", { title: "test" });
});

test.todo("Pull and merge delta from server");
