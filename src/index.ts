import { NodeKwil } from 'kwil';
import { Wallet } from 'ethers';
import type { Signer } from 'ethers';
import {
  ExtensionBuilder,
  InitializeFn,
  MethodFn,
  logFn,
} from 'kwil-extensions';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();

const initKwil = async () => {
  console.log(process.env.KWIL_PROVIDER_URL, 'process.env.KWIL_PROVIDER_URL');
  console.log(process.env.PK, 'process.env.PK');

  const kwil: NodeKwil = new NodeKwil({
    kwilProvider: process.env.KWIL_PROVIDER as string,
  });

  const signer: Signer = new Wallet(process.env.PK as string);

  return { kwil, signer };
};

const initialize: InitializeFn = async (
  metadata: Record<string, string>
): Promise<Record<string, string>> => {
  // set node and currency
  if (!metadata['node']) {
    metadata['node'] = 'http://node1.bundlr.network';
  }

  if (!metadata['currency']) {
    metadata['currency'] = 'matic';
  }

  return metadata;
};

const logger: logFn = (log: string, level: 'info' | 'error' | 'debug') => {
  fs.appendFileSync('logs.txt', log);
};

const start: MethodFn = async ({ metadata, inputs }) => {
  return 'start';
};

function startServer(): void {
  const server = new ExtensionBuilder()
    .named('export_db')
    .withInitializer(initialize)
    .withMethods({
      start,
    })
    .withLoggerFn(logger)
    .port('50052')
    .build();

  process.on('SIGINT', () => {
    server.stop();
  });

  process.on('SIGTERM', () => {
    server.stop();
  });
}

startServer();
