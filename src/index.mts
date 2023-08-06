import {
  ExtensionBuilder,
  InitializeFn,
  MethodFn,
  logFn,
} from 'kwil-extensions';
import * as fs from 'fs';
import Export from './export.mjs';

const initialize: InitializeFn = async (
  metadata: Record<string, string>
): Promise<Record<string, string>> => {
  if (!process.env.ADMIN_PRIVATE_KEY) {
    throw new Error('ADMIN_PRIVATE_KEY not found in ENV file');
  }

  if (!process.env.KWIL_PROVIDER_URL) {
    throw new Error('KWIL_PROVIDER_URL not found in ENV file');
  }

  // check node and currency
  if (!process.env.BUNDLR_NODE_URL) {
    throw new Error('BUNDLR_NODE_URL not found in ENV file');
  }

  if (!process.env.BUNDLR_NODE_CURRENCY) {
    throw new Error('BUNDLR_NODE_CURRENCY not found in ENV file');
  }

  return metadata;
};

const logger: logFn = (log: string, level: 'info' | 'error' | 'debug') => {
  fs.appendFileSync('logs.txt', log);
};

const start: MethodFn = async ({ metadata, inputs }) => {
  const dbid: string = inputs[0]?.toString();

  if (!dbid) {
    throw new Error('No dbid provided');
  }

  const newExport = new Export(dbid);
  return newExport.start();
};

function startServer(): void {
  const port = process.env.EXTENSION_DB_EXPORT_PORT || '50052';

  const server = new ExtensionBuilder()
    .named('db_export')
    .withInitializer(initialize)
    .withMethods({
      start,
    })
    .withLoggerFn(logger)
    .port(port)
    .build();

  console.log('Starting server...');

  process.on('SIGINT', () => {
    server.stop();
  });

  process.on('SIGTERM', () => {
    server.stop();
  });
}

startServer();
