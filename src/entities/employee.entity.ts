// Entidad de dominio: objeto plano, sin dependencias de Mongoose ni de Express.
export interface Employee {
  _id: string;
  name: string;
  position: string;
  baseSalary: number;
  yearsOfService: number;
  finalSalary: number;
  createdAt: Date;
  updatedAt: Date;
}

// Datos que envía el cliente para crear un empleado.
export interface CreateEmployeeDTO {
  name: string;
  position: string;
  baseSalary: number;
  yearsOfService: number;
}

// Datos que se le pasan al repositorio para guardar (incluye el salario ya calculado).
export interface EmployeeData extends CreateEmployeeDTO {
  finalSalary: number;
}
