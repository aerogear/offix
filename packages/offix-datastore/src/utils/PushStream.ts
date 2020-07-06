import Observable from "zen-observable";

export interface Subscription {
    unsubscribe(): void;
}

export interface PushStream<T> {
    push(message: T): void;
    subscribe(listener: (message: T) => void): Subscription;
}

export class ObservablePushStream<T> implements PushStream<T> {
    private observable: Observable<T>;
    private observers: any[] = [];

    constructor() {
        this.observable = new Observable(observer => {
            this.observers.push(observer);
        });
    }

    public push(message: T) {
        this.observers.forEach(o => o.next(message));
    }

    public subscribe(listener: (message: T) => void) {
        return (this.observable.subscribe(listener) as Subscription);
    }
}
