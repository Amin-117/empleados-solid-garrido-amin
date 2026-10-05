export interface ISalaryStrategy {
  calculate(baseSalary: number, yearsOfService: number): number;
}
