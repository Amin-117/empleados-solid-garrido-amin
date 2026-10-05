import mongoose from 'mongoose';

export class Database {
  constructor(private readonly mongoUri: string) {}

  async connect(): Promise<void> {
    await mongoose.connect(this.mongoUri);
    console.log('MongoDB conectado');
  }
}
