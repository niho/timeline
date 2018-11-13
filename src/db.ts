import * as knex from "knex";
import * as path from "path";

const config = require(path.resolve(process.cwd(), "./knexfile.js"));

export const connect = function() {
  return knex(config);
};

export type Database = knex | knex.Transaction;
export type QueryBuilder = knex.QueryBuilder;
export const db: Database = connect();
export const raw: knex.RawBuilder = db.raw;
