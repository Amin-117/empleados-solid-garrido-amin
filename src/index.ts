import 'dotenv/config';
import { Server } from './server.js';

new Server().listen().catch((error) => {
  console.error('No se pudo conectar a MongoDB', error);
  process.exit(1);
});
