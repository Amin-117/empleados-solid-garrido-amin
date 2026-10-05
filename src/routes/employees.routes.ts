import { Router } from 'express';
import { EmployeesController } from '../controllers/employees.controller.js';
import { EmployeeMongoRepository } from '../repositories/employee.mongo.repository.js';
import { EmployeeService } from '../services/employee.service.js';
import { StandardSalaryStrategy } from '../services/strategies/standard-salary.strategy.js';

export class EmployeesRoutes {
  public readonly router: Router = Router();
  private readonly controller: EmployeesController;

  constructor() {
    // Composition root: único lugar donde se eligen las clases concretas.
    const repository = new EmployeeMongoRepository();
    const salaryStrategy = new StandardSalaryStrategy();
    const service = new EmployeeService(repository, salaryStrategy);
    this.controller = new EmployeesController(service);

    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.post('/', this.controller.createEmployee);
    this.router.get('/', this.controller.getEmployees);
    this.router.get('/:id', this.controller.findEmployeeById);
    this.router.put('/:id', this.controller.updateEmployee);
    this.router.delete('/:id', this.controller.deleteEmployee);
  }
}
