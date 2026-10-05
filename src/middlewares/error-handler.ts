import { NextFunction, Request, Response } from 'express';
import { ValidationError } from '../errors/validation.error.js';

// Punto único donde los errores se convierten en respuestas HTTP.
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ValidationError) {
    res.status(400).json({ message: err.message });
    return;
  }

  // JSON mal formado en el body (lo lanza express.json()).
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({ message: 'JSON inválido' });
    return;
  }

  console.error(err);
  res.status(500).json({ message: 'Error interno del servidor' });
}
