# Arquitectura del proyecto

## Estructura

```
src/
├── index.ts                                  punto de entrada (carga .env y arranca el Server)
├── server.ts                                 class Server
├── config/database.ts                        class Database (conexión a MongoDB)
├── entities/employee.entity.ts               Employee, CreateEmployeeDTO, EmployeeData (objetos planos)
├── models/employee.model.ts                  EmployeeMongoModel (schema de Mongoose)
├── repositories/
│   ├── employee.repository.interface.ts      IEmployeeRepository
│   └── employee.mongo.repository.ts          EmployeeMongoRepository
├── services/
│   ├── employee.service.ts                   EmployeeService
│   └── strategies/
│       ├── salary-strategy.interface.ts      ISalaryStrategy
│       └── standard-salary.strategy.ts       StandardSalaryStrategy
├── errors/validation.error.ts                ValidationError
├── middlewares/error-handler.ts              errorHandler
├── controllers/employees.controller.ts       EmployeesController
└── routes/employees.routes.ts                EmployeesRoutes
```

## Flujo de una request

```
Cliente
  │  POST /employees
  ▼
Server              express.json() + monta el router en /employees + errorHandler al final
  ▼
EmployeesRoutes     POST / → controller.createEmployee
  ▼
EmployeesController lee req.body y llama al service
  ▼
EmployeeService     1. validate()                     → si falla, lanza ValidationError
                    2. salaryStrategy.calculate()     → StandardSalaryStrategy
                    3. repository.create()
  ▼
EmployeeMongoRepository   EmployeeMongoModel.create() → toEntity()
  ▼
MongoDB
  │
  └─ vuelta: Document → Employee (objeto plano) → service → controller → 201 + JSON
```

Si algo lanza un error, Express 5 lo atrapa automáticamente (también en funciones `async`) y lo pasa al `errorHandler`.

| Resultado | Respuesta |
|---|---|
| Devuelve el empleado o la lista | 200 (201 en el POST) |
| `null` o `false` (no existe) | 404 `Empleado no encontrado` |
| Se lanza `ValidationError` | 400 con el mensaje de validación |
| JSON mal formado en el body | 400 `JSON inválido` |
| Cualquier otro error | 500 `Error interno del servidor` |

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/employees` | Crea un empleado (calcula `finalSalary`) |
| GET | `/employees` | Lista todos, del más nuevo al más viejo |
| GET | `/employees/:id` | Obtiene uno |
| PUT | `/employees/:id` | Actualiza campos y recalcula `finalSalary` |
| DELETE | `/employees/:id` | Elimina uno |

## Responsabilidades

| Capa | Clase | Responsabilidad |
|---|---|---|
| `entities/` | `Employee` | Forma del dato en el dominio (sin Mongoose) |
| `models/` | `EmployeeMongoModel` | Forma del dato en MongoDB |
| `repositories/` | `EmployeeMongoRepository` | Acceso a datos |
| `services/` | `EmployeeService` | Reglas de negocio (validar, calcular, orquestar) |
| `services/strategies/` | `StandardSalaryStrategy` | Fórmula del salario |
| `errors/` | `ValidationError` | Representar un error de datos del cliente |
| `middlewares/` | `errorHandler` | Convertir errores en respuestas HTTP |
| `controllers/` | `EmployeesController` | Traducir HTTP ↔ service |
| `routes/` | `EmployeesRoutes` | URLs e inyección de dependencias |
| `config/` | `Database` | Conexión a MongoDB |
| `server.ts` | `Server` | Arranque: middlewares, rutas, errores, DB, puerto |

Cada capa conoce solo a la siguiente: el controller no sabe que existe MongoDB, y el service no sabe que existe Express.

---

## SOLID

### S: Responsabilidad Única
Cada clase tiene **una sola razón para cambiar**:
- Cambia la fórmula del salario → solo `StandardSalaryStrategy`.
- Cambia una validación → solo `EmployeeService.validate`.
- Cambia un status code de éxito o 404 → solo `EmployeesController`.
- Cambia el formato de los errores → solo `errorHandler`.
- Cambia la base de datos → solo el repositorio (y `models/`).

En el `server.ts` original, todo eso estaba en un único archivo.

### O: Abierto/Cerrado
`EmployeeService` calcula el salario con `this.salaryStrategy.calculate(...)`, sin conocer ninguna fórmula. Para agregar una fórmula nueva (por ejemplo `ManagerSalaryStrategy`) se crea una clase que implemente `ISalaryStrategy` y se la pasa en `EmployeesRoutes`. **`EmployeeService` no se modifica.**

### L: Sustitución de Liskov
Cualquier implementación de `IEmployeeRepository` tiene que comportarse igual, no solo compilar:
- "No encontrado" devuelve `null` (o `false` en `delete`), nunca una excepción.
- Por eso `EmployeeMongoRepository` usa `isValidObjectId(id)`: un id mal formado da `null` (404), y no un `CastError` (500) que otra base de datos no lanzaría.
- La interfaz devuelve `Employee` (objeto plano) y no un Document de Mongoose, para que un repositorio de Postgres, por ejemplo, también pueda cumplirla.

### I: Segregación de Interfaces
- `ISalaryStrategy` tiene un solo método: `calculate`.
- `IEmployeeRepository` tiene solo los 5 métodos que el service usa: `create`, `findAll`, `findById`, `update` y `delete`.
- La conexión a la base no está en el repositorio: vive en `Database`.

### D: Inversión de Dependencias
`EmployeeService` depende de **interfaces**, no de clases concretas:

```ts
constructor(
  private readonly repository: IEmployeeRepository,
  private readonly salaryStrategy: ISalaryStrategy
) {}
```

No importa Mongoose ni `EmployeeMongoRepository`. Las clases concretas se crean en **un único lugar**, el constructor de `EmployeesRoutes`:

```ts
const repository = new EmployeeMongoRepository();
const salaryStrategy = new StandardSalaryStrategy();
const service = new EmployeeService(repository, salaryStrategy);
this.controller = new EmployeesController(service);
```

Para cambiar de MongoDB a otra base de datos, alcanza con crear otro repositorio que implemente `IEmployeeRepository` y cambiar esa línea. El service y el controller no se tocan.
