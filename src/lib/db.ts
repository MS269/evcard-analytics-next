import OracleDB from 'oracledb';

import { logger } from './logger';

export const dbConfig: OracleDB.ConnectionAttributes = {
  user: process.env.DB_USERNAME!,
  password: process.env.DB_PASSWORD!,
  connectString: `${process.env.DB_HOST!}:${process.env.DB_PORT!}/${process.env.DB_SID!}`,
};

if (!dbConfig.user || !dbConfig.password || !dbConfig.connectString) {
  logger.error('env', 'DB config not found. Read README.md.');
}

// (async function init() {
//   try {
//     await OracleDB.createPool(dbConfig);
//   } catch (error) {
//     logger.error('DB', error);
//   }
// })();
