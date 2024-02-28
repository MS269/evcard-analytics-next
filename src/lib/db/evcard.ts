import OracleDB from 'oracledb';

export const evcardDatabaseConfig: OracleDB.ConnectionAttributes = {
  user: process.env.EVCARD_DB_USER!,
  password: process.env.EVCARD_DB_PASSWORD!,
  connectString: process.env.EVCARD_DB_CONNECT_STRING!,
};

if (
  !evcardDatabaseConfig.user ||
  !evcardDatabaseConfig.password ||
  !evcardDatabaseConfig.connectString
) {
  throw new Error(
    'Oracle Evacard DB Config not found. Read README.md and setup env.local.',
  );
}
