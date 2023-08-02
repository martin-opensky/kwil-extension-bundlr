import {
  ExtensionBuilder,
  InitializeFn,
  MethodFn,
  logFn,
} from 'kwil-extensions';
import { nanoid } from 'nanoid';
import * as fs from 'fs';

const initialize: InitializeFn = async (
  metadata: Record<string, string>
): Promise<Record<string, string>> => {
  return metadata;
};

const logger: logFn = (log: string, level: 'info' | 'error' | 'debug') => {
  fs.appendFileSync('logs.txt', log);
};

const generate: MethodFn = async ({ metadata, inputs }) => {
  const id = nanoid();

  logger(`Generating Id ${id}`, 'info');

  return id;
};

function startServer(): void {
  const server = new ExtensionBuilder()
    .named('unique_id')
    .withInitializer(initialize)
    .withMethods({
      generate,
    })
    .withLoggerFn(logger)
    .port('50051')
    .build();

  process.on('SIGINT', () => {
    server.stop();
  });

  process.on('SIGTERM', () => {
    server.stop();
  });
}

startServer();
