export type RemoveListener = (
  () => void
);

export type Listener<T> = (
  (data: T) => void | Promise<void>
);

export interface EventRegistry {
  'error': Error;
}

export interface EventEmitter<R extends EventRegistry> {
  emit<E extends keyof R>(event: E, data: R[E]): Promise<void>;
  on<E extends keyof R>(event: E, listener: Listener<R[E]>): RemoveListener;
  once<E extends keyof R>(event: E, listener: Listener<R[E]>): RemoveListener;
  get<E extends keyof R>(event: E): Promise<R[E]>;
  off<E extends keyof R>(event: E, listener: Listener<R[E]>): void;
}

export type EventEmitterCtor = (
  new <R extends EventRegistry>(options?: EventOptions<R>) => EventEmitter<R>
);

export type EventOptions<R extends EventRegistry> = {
  [E in keyof Partial<R>]: EventOption<R[E]>;
};

export interface EventOption<T> {
  stateful?: boolean;
  initialData?: T;
}

export class EventDispatchError extends Error {
  constructor(message: string, public reason?: any, public event?: string, public data?: any) {
    super(message);
  }
}
