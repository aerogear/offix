import {
    ApolloLink,
    FetchResult,
    NextLink,
    Observable,
    Operation
} from "apollo-link";
import { hasDirectives, getDirectiveNames } from "apollo-utilities";
import { Observer } from "zen-observable-ts";
import { PersistedData, PersistentStore } from "../PersistentStore";
import { Directives } from "../config/Constants";

export interface OperationQueueEntry {
    operation: Operation;
    forward: NextLink;
    observer: Observer<FetchResult>;
    subscription?: { unsubscribe: () => void };
}

export default class QueueLink extends ApolloLink {
    private opQueue: OperationQueueEntry[] = [];
    private isOpen: boolean = true;
    private storage: PersistentStore<PersistedData>;
    private key: string;

    constructor(storage: PersistentStore<PersistedData>, key: string) {
        super();
        this.storage = storage;
        this.key = key;
    }

    public open() {
        this.isOpen = true;
        this.opQueue.forEach(({ operation, forward, observer }) => {
            forward(operation).subscribe(observer);
        });
        this.opQueue = [];
    }

    public close() {
        this.isOpen = false;
    }

    public request(operation: Operation, forward: NextLink ) {
        // TODO split this conditional and add a handler to notify of online only cases
        if (this.isOpen || hasDirectives([Directives.ONLINE_ONLY], operation.query)) {
            return forward(operation);
        }
        return new Observable(observer => {
            const operationEntry = { operation, forward, observer };
            this.enqueue(operationEntry);
            return () => this.cancelOperation(operationEntry);
        });
    }

    private cancelOperation(entry: OperationQueueEntry) {
        this.opQueue = this.opQueue.filter(e => e !== entry);
        this.storage.setItem(this.key, JSON.stringify(this.opQueue));
    }

    private enqueue(entry: OperationQueueEntry) {
        this.opQueue.push(entry);
        this.storage.setItem(this.key, JSON.stringify(this.opQueue));
    }
}
