// tslint:disable:no-console

import Emitter, { EventRegistry } from '../src/index';

export interface FooBarData {
  n: number;
}

export interface FooBazData {
  b: boolean;
}

interface Events extends EventRegistry {
  'transient:foo': string;
  'stateful:bar': FooBarData;
  'stateful:baz': FooBazData;
}

const emitter = new Emitter<Events>({
  'stateful:bar': { stateful: true },
  'stateful:baz': { stateful: true, initialData: { b: true } },
});

emitter.on('transient:foo', (data) => {
  console.info(data.replace('world', 'everybody'));
});

emitter.emit('transient:foo', 'Hello, world.');
