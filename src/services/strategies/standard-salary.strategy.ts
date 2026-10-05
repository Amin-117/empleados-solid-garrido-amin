import { ISalaryStrategy } from './salary-strategy.interface.js';

// salario final = salario base + 2% del salario base por cada año de antigüedad
export class StandardSalaryStrategy implements ISalaryStrategy {
  calculate(baseSalary: number, yearsOfService: number): number {
    const bonus = baseSalary * 0.02 * yearsOfService;
    return baseSalary + bonus;
  }
}
