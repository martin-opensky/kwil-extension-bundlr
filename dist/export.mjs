var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { NodeKwil } from 'kwil';
import Bundlr from '@bundlr-network/client';
import { nanoid } from 'nanoid';
import { Wallet } from 'ethers';
export default class Export {
    constructor(dbid) {
        this.dbTables = [];
        this.kwil = new NodeKwil({
            kwilProvider: process.env.KWIL_PROVIDER_URL,
        });
        this.dbid = dbid;
        this.signer = new Wallet(process.env.ADMIN_PRIVATE_KEY);
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.getSchema();
                yield this.getTableData();
                const txId = yield this.prepareExport();
                return txId;
            }
            catch (error) {
                console.log('Error => ', error);
                throw error;
            }
        });
    }
    getSchema() {
        return __awaiter(this, void 0, void 0, function* () {
            const schema = yield this.kwil.getSchema(this.dbid);
            if (!schema.data) {
                throw new Error('No schema data found');
            }
            this.schema = schema.data;
            const tables = this.schema.tables;
            if (!tables.length) {
                throw new Error('No tables found');
            }
            this.dbTables = tables;
        });
    }
    getTableData() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const tableData = [];
            for (const table of this.dbTables) {
                const tableName = table.name;
                const result = yield this.kwil.selectQuery(this.dbid, `SELECT * FROM ${tableName}`);
                if (result && result.status === 200 && ((_a = result.data) === null || _a === void 0 ? void 0 : _a.length)) {
                    tableData.push({
                        name: tableName,
                        data: result.data,
                    });
                }
            }
            if (!tableData.length) {
                throw new Error('No data to export');
            }
            this.exportData = {
                dbid: this.dbid,
                schema: this.schema,
                tableData,
            };
        });
    }
    prepareExport() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.exportData || !this.schema) {
                throw new Error('No export data found');
            }
            console.log('Saving Export => ');
            const exportId = nanoid();
            const providerAddress = yield this.signer.getAddress();
            const provideSignature = yield this.signer.signMessage(exportId);
            const tags = [
                { name: 'Application', value: 'KwilDb' },
                { name: 'Content-Type', value: 'application/json' },
                { name: 'DB-Owner', value: this.schema.owner },
                { name: 'DB-Name', value: this.schema.name },
                { name: 'DBID', value: this.dbid },
                { name: 'Type', value: 'Export' },
                { name: 'Export-Id', value: exportId },
                { name: 'Provider-Address', value: providerAddress },
                { name: 'Signature', value: provideSignature },
            ];
            console.log('BUNDLR_NODE_URL => ', process.env.BUNDLR_NODE_URL);
            console.log('BUNDLR_NODE_CURRENCY => ', process.env.BUNDLR_NODE_CURRENCY);
            const bundlr = new Bundlr(process.env.BUNDLR_NODE_URL, process.env.BUNDLR_NODE_CURRENCY, process.env.ADMIN_PRIVATE_KEY);
            const response = yield bundlr.upload(JSON.stringify(this.exportData), {
                tags,
            });
            if (response && !response.id) {
                throw new Error('No response id found');
            }
            console.log(`Data Available at => https://arweave.net/${response.id}`);
            console.log(`DBID => ${this.dbid}`);
            return `https://arweave.net/${response.id}`;
        });
    }
}
