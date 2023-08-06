import { NodeKwil } from 'kwil';
import Bundlr from '@bundlr-network/client';
import { nanoid } from 'nanoid';
import { Database, Table } from 'kwil/dist/core/database';
import { Wallet } from 'ethers';

type TableData = {
  name: string;
  data: any[];
};

type ExportJson = {
  dbid: string;
  schema: Database<string> | undefined;
  tableData: TableData[];
};

export default class Export {
  kwil: NodeKwil;
  dbid: string;
  dbTables: readonly Table<string>[] = [];
  schema: Database<string> | undefined;
  exportData: ExportJson | undefined;
  signer: Wallet;

  constructor(dbid: string) {
    this.kwil = new NodeKwil({
      kwilProvider: process.env.KWIL_PROVIDER_URL as string,
    });

    this.dbid = dbid;

    this.signer = new Wallet(process.env.ADMIN_PRIVATE_KEY as string);
  }

  async start() {
    try {
      await this.getSchema();
      await this.getTableData();
      const txId = await this.prepareExport();
      return txId;
    } catch (error) {
      console.log('Error => ', error);
      throw error;
    }
  }

  private async getSchema() {
    const schema = await this.kwil.getSchema(this.dbid);

    if (!schema.data) {
      throw new Error('No schema data found');
    }

    this.schema = schema.data;

    const tables = this.schema.tables;

    if (!tables.length) {
      throw new Error('No tables found');
    }

    this.dbTables = tables;
  }

  private async getTableData() {
    const tableData: TableData[] = [];
    for (const table of this.dbTables) {
      const tableName = table.name;
      const result = await this.kwil.selectQuery(
        this.dbid,
        `SELECT * FROM ${tableName}`
      );

      if (result && result.status === 200 && result.data?.length) {
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
  }

  private async prepareExport() {
    if (!this.exportData || !this.schema) {
      throw new Error('No export data found');
    }

    console.log('Saving Export => ');

    const exportId = nanoid();

    const providerAddress = await this.signer.getAddress();
    const provideSignature = await this.signer.signMessage(exportId);

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

    const bundlr = new Bundlr(
      process.env.BUNDLR_NODE_URL as string,
      process.env.BUNDLR_NODE_CURRENCY as string,
      process.env.ADMIN_PRIVATE_KEY as string
    );

    const response = await bundlr.upload(JSON.stringify(this.exportData), {
      tags,
    });

    if (response && !response.id) {
      throw new Error('No response id found');
    }

    console.log(`Data Available at => https://arweave.net/${response.id}`);
    console.log(`DBID => ${this.dbid}`);

    return response.id;
  }
}
