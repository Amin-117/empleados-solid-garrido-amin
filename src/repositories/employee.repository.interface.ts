import { Employee, EmployeeData } from '../entities/employee.entity.js';

// Contrato que debe cumplir cualquier repositorio (Mongo, Postgres, memoria...).
// "No encontrado" se indica con null / false, nunca con una excepción.
export interface IEmployeeRepository {
  create(data: EmployeeData): Promise<Employee>;
  findAll(): Promise<Employee[]>;
  findById(id: string): Promise<Employee | null>;
  update(id: string, data: EmployeeData): Promise<Employee | null>;
  delete(id: string): Promise<boolean>;
}
