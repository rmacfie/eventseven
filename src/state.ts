import { ErrorSubscriber, GlobalSubscriber, State, Subscriber, Unsubscribe } from './types';

export default class StateImpl<M extends {}> implements State<M> {
  private readonly values = new Map<keyof M, any>();
  private readonly valueSubscribers = new Map<keyof M, Set<Subscriber<any>>>();
  private readonly errorSubscribers = new Set<ErrorSubscriber<M>>();
  private readonly globalSubscribers = new Set<GlobalSubscriber<M>>();

  constructor(initialValues?: Partial<M>) {
    if (initialValues != null) {
      Object.getOwnPropertyNames(initialValues).forEach((key) => {
        const value = (initialValues as any)[key];
        this.values.set(key as any, value);
      });
    }
  }

  public get = <K extends keyof M>(key: K): M[K] | undefined => {
    this.validateKey(key);
    return this.values.get(key);
  }

  public set = <K extends keyof M>(key: K, value: M[K]): void => {
    this.validateKey(key);

    const oldValue = this.values.get(key);
    this.values.set(key, value);
    this.runAsync(() => {
      this.notify(key, value, oldValue);
    });
  }

  public on = <K extends keyof M>(key: K, subscriber: Subscriber<M[K]>): Unsubscribe => {
    this.validateKey(key);
    this.validateSubscriber(subscriber);
    const subscribers = this.getOrAddSubscribers(key);
    subscribers.add(subscriber);
    return () => subscribers.delete(subscriber);
  }

  public onAll = (subscriber: GlobalSubscriber<M>): Unsubscribe => {
    this.validateSubscriber(subscriber);
    this.globalSubscribers.add(subscriber);
    return () => this.globalSubscribers.delete(subscriber);
  }

  public onError = (subscriber: ErrorSubscriber<M>): Unsubscribe => {
    this.validateSubscriber(subscriber);
    this.errorSubscribers.add(subscriber);
    return () => this.errorSubscribers.delete(subscriber);
  }

  private notify<K extends keyof M>(key: K, value: M[K], oldValue?: M[K]) {
    const subscribers = this.valueSubscribers.get(key) as Set<Subscriber<M[K]>> | undefined;
    if (subscribers == null) {
      return;
    }
    const errors: any[] = [];
    subscribers.forEach((subscriber) => {
      try {
        subscriber(value, oldValue);
      } catch (err) {
        errors.push(err);
      }
    });
    this.globalSubscribers.forEach((subscriber) => {
      try {
        subscriber(key, value, oldValue);
      } catch (err) {
        errors.push(err);
      }
    });
    this.runAsync(() => {
      errors.forEach((err) => {
        this.notifyError(err, key, value, oldValue);
      });
    });
  }

  private notifyError<K extends keyof M>(err: any, key: K, value: M[K], oldValue?: M[K]) {
    this.errorSubscribers.forEach((subscriber) => {
      try {
        subscriber(err, key, value, oldValue);
      } catch (innerErr) {
        // tslint:disable-next-line:no-console
        console.error(`An error subscriber failed while handling an error`, innerErr);
      }
    });
  }

  private runAsync(callback: () => void) {
    setTimeout(callback, 0);
  }

  private validateKey(key: keyof M) {
    if (typeof key !== 'string' || key.length === 0) {
      throw new Error(`Invalid argument 'key': must be a non-empty string`);
    }
  }

  private validateSubscriber(subscriber: Subscriber<any> | GlobalSubscriber<M> | ErrorSubscriber<M>) {
    if (typeof subscriber !== 'function') {
      throw new Error(`Invalid argument 'subscriber': must be a function`);
    }
  }

  private getOrAddSubscribers<K extends keyof M>(key: K): Set<Subscriber<M[K]>> {
    if (!this.valueSubscribers.has(key)) {
      this.valueSubscribers.set(key, new Set());
    }

    return this.valueSubscribers.get(key)!;
  }
}
