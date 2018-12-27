import Dispatcher from './Dispatcher';
import Logger from './Logger';
import { EventEmitter, EventRegistry, Listener, RemoveListener } from './types';

type Context<T> = {
  listeners: Set<Listener<T>>;
  stateful: boolean;
  state?: T;
};

type ContextMap<R extends EventRegistry> = (
  Map<keyof R, Context<any>>
);

const RESOLVED = Promise.resolve();

export default class Emitter<R extends EventRegistry> implements EventEmitter<R> {
  private readonly contexts: ContextMap<R> = new Map();
  private readonly dispatcher = new Dispatcher<R>(this);

  public emit = async <E extends keyof R>(event: E, data: R[E]): Promise<void> => {
    const context = this.getOrAddContext(event);
    context.state = data;
    if (context.listeners.size === 0) {
      await RESOLVED;
      Logger.info(`Emitted '${event}' to 0 listeners`);
    } else {
      const listeners = [...context.listeners];
      const promises = listeners.map((listener) => {
        return this.dispatcher.dispatch(event, data, listener);
      });
      await Promise.all(promises);
      Logger.info(`Emitted '${event}' to ${listeners.length} listeners`);
    }
  }

  public on = <E extends keyof R>(event: E, listener: Listener<R[E]>): RemoveListener => {
    const context = this.getOrAddContext(event);
    if (context.stateful && context.state !== undefined) {
      this.dispatcher.dispatch(event, context.state, listener);
    }
    context.listeners.add(listener);
    Logger.info(`Added a listener for '${event}'`);
    return () => this.off(event, listener);
  }

  public once = <E extends keyof R>(event: E, listener: Listener<R[E]>): RemoveListener => {
    const remove = this.on(event, (data) => {
      remove();
      return listener(data);
    });
    return remove;
  }

  public get = <E extends keyof R>(event: E): Promise<R[E]> => {
    return new Promise<R[E]>((resolve) => {
      const remove = this.on(event, (data) => {
        remove();
        resolve(data);
      });
    });
  }

  public off = <E extends keyof R>(event: E, listener: Listener<R[E]>): void => {
    const context = this.getOrAddContext(event);
    context.listeners.delete(listener);
    Logger.info(`Removed a listener for '${event}'`);
  }

  private getOrAddContext<E extends keyof R>(event: E): Context<R[E]> {
    let context = this.contexts.get(event);
    if (context == null) {
      context = { listeners: new Set(), stateful: false };
      this.contexts.set(event, context);
    }
    return context;
  }
}
