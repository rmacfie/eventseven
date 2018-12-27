import Logger from './Logger';
import { EventDispatchError, EventEmitter, EventRegistry, Listener } from './types';

export default class Dispatcher<R extends EventRegistry> {
  constructor(private readonly emitter: EventEmitter<R>) {
  }

  public async dispatch<E extends keyof R>(event: E, data: R[E], listener: Listener<R[E]>): Promise<void> {
    try {
      await listener(data);
      Logger.info(`Dispatched '${event}' to a listener`);
    } catch (err) {
      Logger.error(`A listener failed while handling '${event}'`, err);
      if (event !== 'error') {
        this.emitter.emit('error', new EventDispatchError(
          `A listener failed while handling '${event}'`, err, event as any, data,
        ));
      }
    }
  }
}
