  // tslint:disable:no-console
  // tslint:disable:ban-types

import State from '../src/index';

interface MyModel {
  user: { id: number; name: string; } | null;
  pageViews: number;
  foo: Function;
}

const state = new State<MyModel>({
  pageViews: 0,
  foo: () => { /* no op */ },
});

state.on('pageViews', (value, old) => {
  console.log(`Page Views was changed from ${old} to ${value}`);
});

state.set('pageViews', 1);
