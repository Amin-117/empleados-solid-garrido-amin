import { CreateEmployeeDTO, Employee } from '../entities/employee.entity.js';
import { IEmployeeRepository } from '../repositories/employee.repository.interface.js';
import { ISalaryStrategy } from './strategies/salary-strategy.interface.js';
import { ValidationError } from '../errors/validation.error.js';

export class EmployeeService {
  // DIP: depende de interfaces, no de clases concretas.
  constructor(
    private readonly repository: IEmployeeRepository,
    private readonly salaryStrategy: ISalaryStrategy
  ) {}

  async createEmployee(data: CreateEmployeeDTO): Promise<Employee> {
    this.validate(data);

    const { name, position, baseSalary, yearsOfService } = data;
    const finalSalary = this.salaryStrategy.calculate(baseSalary, yearsOfService);

    const employee = await this.repository.create({
      name,
      position,
      baseSalary,
      yearsOfService,
      finalSalary
    });

    console.log(`Empleado creado: ${employee.name} - salario final: ${employee.finalSalary}`);
    return employee;
  }

  async getAllEmployees(): Promise<Employee[]> {
    return this.repository.findAll();
  }

  async getEmployeeById(id: string): Promise<Employee | null> {
    return this.repository.findById(id);
  }

  async updateEmployee(id: string, data: Partial<CreateEmployeeDTO>): Promise<Employee | null> {
    const current = await this.repository.findById(id);
    if (!current) return null;

    // Los campos que no vienen en el body conservan su valor actual.
    const merged: CreateEmployeeDTO = {
      name: data.name ?? current.name,
      position: data.position ?? current.position,
      baseSalary: data.baseSalary ?? current.baseSalary,
      yearsOfService: data.yearsOfService ?? current.yearsOfService
    };
    this.validate(merged);

    // El salario final se recalcula siempre: nunca se acepta desde el cliente.
    const finalSalary = this.salaryStrategy.calculate(merged.baseSalary, merged.yearsOfService);
    return this.repository.update(id, { ...merged, finalSalary });
  }

  async deleteEmployee(id: string): Promise<boolean> {
    return this.repository.delete(id);
  }

  // Mismas reglas y mensajes que el server.ts original.
  private validate(data: CreateEmployeeDTO): void {
    const { name, position, baseSalary, yearsOfService } = data;

    if (!name || !position) {
      throw new ValidationError('Nombre y puesto son obligatorios');
    }

    if (typeof baseSalary !== 'number' || baseSalary <= 0) {
      throw new ValidationError('El salario base debe ser mayor a 0');
    }

    if (
      typeof yearsOfService !== 'number' ||
      yearsOfService < 0 ||
      !Number.isInteger(yearsOfService)
    ) {
      throw new ValidationError('La antigüedad debe ser un entero mayor o igual a 0');
    }
  }
}
