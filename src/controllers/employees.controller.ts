import { Request, Response } from 'express';
import { EmployeeService } from '../services/employee.service.js';

type IdParams = { id: string };

// Traduce HTTP <-> service. No valida ni calcula: eso es del service.
// Los errores (ValidationError o inesperados) los atrapa Express 5 y los manda al errorHandler.
export class EmployeesController {
  constructor(private readonly employeeService: EmployeeService) {}

  // Arrow functions: mantienen el "this" al pasarlas sueltas al router.
  createEmployee = async (req: Request, res: Response): Promise<void> => {
    const employee = await this.employeeService.createEmployee(req.body ?? {});
    res.status(201).json(employee);
  };

  getEmployees = async (_req: Request, res: Response): Promise<void> => {
    const employees = await this.employeeService.getAllEmployees();
    res.json(employees);
  };

  findEmployeeById = async (req: Request<IdParams>, res: Response): Promise<void> => {
    const employee = await this.employeeService.getEmployeeById(req.params.id);
    if (!employee) {
      res.status(404).json({ message: 'Empleado no encontrado' });
      return;
    }
    res.json(employee);
  };

  updateEmployee = async (req: Request<IdParams>, res: Response): Promise<void> => {
    const employee = await this.employeeService.updateEmployee(req.params.id, req.body ?? {});
    if (!employee) {
      res.status(404).json({ message: 'Empleado no encontrado' });
      return;
    }
    res.json(employee);
  };

  deleteEmployee = async (req: Request<IdParams>, res: Response): Promise<void> => {
    const deleted = await this.employeeService.deleteEmployee(req.params.id);
    if (!deleted) {
      res.status(404).json({ message: 'Empleado no encontrado' });
      return;
    }
    res.json({ message: 'Empleado eliminado' });
  };
}
