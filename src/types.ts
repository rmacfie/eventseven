export interface Subscriber<T> {
  (value: T, oldValue?: T): void;
}

export interface GlobalSubscriber<M extends {}> {
  <K extends keyof M>(key: K, value: M[K], oldValue?: M[K]): void;
}

export interface ErrorSubscriber<M extends {}> {
  <K extends keyof M>(err: any, key: K, value: M[K], oldValue?: M[K]): void;
}

export interface Unsubscribe {
  (): void;
}

export interface State<M extends {}> {
  get<K extends keyof M>(key: K): M[K] | undefined;
  set<K extends keyof M>(key: K, value: M[K]): void;
  on<K extends keyof M>(key: K, subscriber: Subscriber<M[K]>): Unsubscribe;
  onAll(subscriber: GlobalSubscriber<M>): Unsubscribe;
  onError(subscriber: ErrorSubscriber<M>): Unsubscribe;
}

export interface StateCtor {
  new <M extends {}>(initialValues?: Partial<M>): State<M>;
}
