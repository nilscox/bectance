class ApiError extends Error {
  constructor(
    message: string,
    public readonly extra?: unknown,
  ) {
    super(message);
  }
}

export class BadRequestError extends ApiError {
  static status = 400;
}

export class NotFoundError extends ApiError {
  static status = 404;
}
