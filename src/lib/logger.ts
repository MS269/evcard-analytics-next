export const logger = {
  log: (name: string, msg: any) => console.log(`${name}: ${msg}`),
  error: (name: string, msg: any) => console.error(`${name}: ${msg}`),
};
