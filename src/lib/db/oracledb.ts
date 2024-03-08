import type { ConnectionAttributes } from 'oracledb';

export const oracledb: ConnectionAttributes = {
  user: process.env.ORACLEDB_USER,
  password: process.env.ORACLEDB_PASSWORD,
  connectString: process.env.ORACLEDB_CONNECT_STRING,
};
