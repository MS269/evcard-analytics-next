export const logger = (name: string) => ({
  log: (message: any) => console.log(`[${name}]: ${message}`),
  error: (message: any) => console.error(`[${name}]: ${message}`),
});
