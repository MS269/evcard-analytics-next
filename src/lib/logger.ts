export class Logger {
  private readonly name: string;

  constructor(name: string) {
    this.name = name;
  }

  log(message: any) {
    console.log(`[${this.name}]: ${message}`);
  }

  error(message: any) {
    console.error(`[${this.name}]: ${message}`);
  }
}
