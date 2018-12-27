const noop = () => {
  // no-op
};

export interface Logger {
  info(message: string, ...context: any[]): void;
  warn(message: string, ...context: any[]): void;
  error(message: string, ...context: any[]): void;
}

export class VoidLogger implements Logger {
  public info = noop;
  public warn = noop;
  public error = noop;
}

export class ConsoleLogger implements Logger {
  // tslint:disable-next-line:no-console
  public info = console.info;
  // tslint:disable-next-line:no-console
  public warn = console.warn;
  // tslint:disable-next-line:no-console
  public error = console.error;
}

let instance: Logger = new VoidLogger();

export function use(logger: Logger) {
  instance = logger;
}

export default {
  info: (message, ...context) => {
    instance.info(message, ...context);
  },
  warn: (message, ...context) => {
    instance.warn(message, ...context);
  },
  error: (message, ...context) => {
    instance.error(message, ...context);
  },
} as Logger;
