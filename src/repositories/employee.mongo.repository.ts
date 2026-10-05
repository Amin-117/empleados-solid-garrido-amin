import { isValidObjectId } from 'mongoose';
import { IEmployeeRepository } from './employee.repository.interface.js';
import { Employee, EmployeeData } from '../entities/employee.entity.js';
import { EmployeeMongoModel } from '../models/employee.model.js';

type EmployeeDocument = InstanceType<typeof EmployeeMongoModel>;

export class EmployeeMongoRepository implements IEmployeeRepository {
  async create(data: EmployeeData): Promise<Employee> {
    const doc = await EmployeeMongoModel.create(data);
    return this.toEntity(doc);
  }

  async findAll(): Promise<Employee[]> {
    const docs = await EmployeeMongoModel.find().sort({ createdAt: -1 });
    return docs.map((doc) => this.toEntity(doc));
  }

  async findById(id: string): Promise<Employee | null> {
    if (!isValidObjectId(id)) return null;
    const doc = await EmployeeMongoModel.findById(id);
    return doc ? this.toEntity(doc) : null;
  }

  async update(id: string, data: EmployeeData): Promise<Employee | null> {
    if (!isValidObjectId(id)) return null;
    const doc = await EmployeeMongoModel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true
    });
    return doc ? this.toEntity(doc) : null;
  }

  async delete(id: string): Promise<boolean> {
    if (!isValidObjectId(id)) return false;
    const doc = await EmployeeMongoModel.findByIdAndDelete(id);
    return doc !== null;
  }

  // Convierte el Document de Mongoose en un objeto plano del dominio.
  private toEntity(doc: EmployeeDocument): Employee {
    return {
      _id: doc._id.toString(),
      name: doc.name,
      position: doc.position,
      baseSalary: doc.baseSalary,
      yearsOfService: doc.yearsOfService,
      finalSalary: doc.finalSalary,
      createdAt: doc.get('createdAt'),
      updatedAt: doc.get('updatedAt')
    };
  }
}
