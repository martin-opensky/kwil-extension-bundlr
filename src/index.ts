import { NodeKwil } from "kwil";
import { Wallet } from "ethers";
import type { Signer } from "ethers";
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

  console.log(process.env.KWIL_PROVIDER_URL, 'process.env.KWIL_PROVIDER_URL')
  console.log(process.env.PK, 'process.env.PK')

  const kwil: NodeKwil = new NodeKwil({
    kwilProvider: process.env.KWIL_PROVIDER as string
  });

  const signer: Signer = new Wallet(process.env.PK as string);

  return { kwil, signer };
}

const initialize: InitializeFn = async (
  metadata: Record<string, string>
): Promise<Record<string, string>> => {
  // set node and currency
  if(!metadata['node']) {
    metadata['node'] = 'http://node2.bundlr.network';
  }

  if(!metadata['currency']) {
    metadata['currency'] = 'matic';
  }

  return metadata;
};

const logger: logFn = (log: string, level: 'info' | 'error' | 'debug') => {
  fs.appendFileSync('logs.txt', log);
};

const backup: MethodFn = async ({ metadata, inputs }) => {

  console.log(process.env.KWIL_PROVIDER_URL, 'process.env.KWIL_PROVIDER_URL')
  console.log(process.env.PK, 'process.env.PK')

  return process.env.KWIL_PROVIDER_URL ?? 'no env';
  // const dbid: string = inputs[0].toString();
  // const { kwil } = await initKwil();
   
  // const schema = await kwil.getSchema(dbid);
  // const tables = schema.data?.tables;

  // if(!tables) {
  //   throw new Error('No tables found');
  // }

  // console.log(tables, 'tables')

  // // Will get the schema from the local KwilDb provider and backup each table
  // return 'backup';
};

const insert: MethodFn = async ({ metadata, inputs }) => {
  // Params: DbId, Table, Id
  // Receive the DbId, Table and Id
  // Get the schema from the local KwilDb provider to get the name of the primary key
  // Query the DB table where the primary key is equal to the Id
  // Save JSON response to Bundlr and return TxHash
  // {
  //   data: {
  //     id: '123'
  //     name: 'John',
  //     age: 30,
  //   }
  // }

  return 'insert';
};

const update: MethodFn = async ({ metadata, inputs }) => {
  // Same as insert, only that we separate the primary Id date from the rest of the data
  // {
  //   where: {
  //     id: '123',
  //   },
  //   data: {
  //     name: 'Peter',
  //     age: 30,
  //   },
  // }
  return 'update';
};

const deleteRow: MethodFn = async ({ metadata, inputs }) => {
  // Same as update, only we only have the where clause
  // {
  //   where: {
  //     id: '123',
  //   }
  // }
  return 'update';
};


function startServer(): void {
  const server = new ExtensionBuilder()
    .named('bundlr')
    .withInitializer(initialize)
    .withMethods({
      backup,
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
