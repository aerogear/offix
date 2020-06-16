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
    private observer: any;

    constructor() {
        this.observable = new Observable(observer => {
            this.observer = observer;
        });
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        this.observable.subscribe((e) => {});
    }

    public push(message: T) {
        this.observer.next(message);
    }

    public subscribe(listener: (message: T) => void) {
        return (this.observable.subscribe(listener) as Subscription);
    }
}
