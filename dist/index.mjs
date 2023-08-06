var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ExtensionBuilder, } from 'kwil-extensions';
import * as fs from 'fs';
import Export from './export.mjs';
const initialize = (metadata) => __awaiter(void 0, void 0, void 0, function* () {
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
});
const logger = (log, level) => {
    fs.appendFileSync('logs.txt', log);
};
const start = ({ metadata, inputs }) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const dbid = (_a = inputs[0]) === null || _a === void 0 ? void 0 : _a.toString();
    if (!dbid) {
        throw new Error('No dbid provided');
    }
    const newExport = new Export(dbid);
    return newExport.start();
});
function startServer() {
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
