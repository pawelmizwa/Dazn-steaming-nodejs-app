import { ValidationError } from "class-validator";

export class HttpErrorResponse<
  T extends { message: string } = { message: string; errors?: any[]; kind?: string }
> extends Error {
  constructor(readonly statusCode: number, readonly body: T) {
    super(body.message);
    Object.setPrototypeOf(this, HttpErrorResponse.prototype);
  }
}

export class TransformError extends Error {
  constructor(readonly message: string, readonly validationErrors: ValidationError[]) {
    super(message);
    Object.setPrototypeOf(this, TransformError.prototype);
  }
}
