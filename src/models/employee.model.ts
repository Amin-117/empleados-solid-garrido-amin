import { Schema, model } from 'mongoose';
import { EmployeeData } from '../entities/employee.entity.js';

const employeeSchema = new Schema<EmployeeData>(
  {
    name: { type: String, required: true },
    position: { type: String, required: true },
    baseSalary: { type: Number, required: true },
    yearsOfService: { type: Number, required: true },
    finalSalary: { type: Number, required: true }
  },
  { timestamps: true }
);

export const EmployeeMongoModel = model<EmployeeData>('Employee', employeeSchema);
