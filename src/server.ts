import express, { Application } from 'express';
import { Database } from './config/database.js';
import { EmployeesRoutes } from './routes/employees.routes.js';
import { errorHandler } from './middlewares/error-handler.js';

export class Server {
  private readonly app: Application;
  private readonly port: number;
  private readonly db: Database;

  constructor() {
    this.app = express();
    this.port = Number(process.env.PORT ?? 3000);
    this.db = new Database(process.env.MONGO_URI ?? 'mongodb://localhost:27017/employees_db');

    this.middlewares();
    this.routes();
    this.errorHandling();
  }

  private middlewares(): void {
    this.app.use(express.json());
  }

  private routes(): void {
    this.app.use('/employees', new EmployeesRoutes().router);
  }

  // Va al final: Express solo lo usa si una ruta anterior lanzó un error.
  private errorHandling(): void {
    this.app.use(errorHandler);
  }

  async listen(): Promise<void> {
    await this.db.connect();
    this.app.listen(this.port, () => {
      console.log(`Servidor escuchando en http://localhost:${this.port}`);
    });
  }
}
