// Error de negocio: datos inválidos enviados por el cliente (se responde 400).
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
