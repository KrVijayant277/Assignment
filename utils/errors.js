// Custom error classes for different error types

// Base custom error class
class AppError extends Error {
  constructor(message, type, statusCode, details = {}) {
    super(message);
    this.name = this.constructor.name;
    this.type = type;
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Validation errors (400)
export class ValidationError extends AppError {
  constructor(message, details = {}) {
    super(message, 'ValidationError', 400, details);
  }
}

// Authentication errors (401)
export class AuthenticationError extends AppError {
  constructor(message, details = {}) {
    super(message, 'AuthenticationError', 401, details);
  }
}

// Forbidden errors (403)
export class ForbiddenError extends AppError {
  constructor(message, details = {}) {
    super(message, 'ForbiddenError', 403, details);
  }
}

// Not found errors (404)
export class NotFoundError extends AppError {
  constructor(message, details = {}) {
    super(message, 'NotFoundError', 404, details);
  }
}

// Database errors
export class DatabaseError extends AppError {
  constructor(message, details = {}) {
    super(message, 'DatabaseError', 500, details);
  }
}

export default {
  ValidationError,
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
  DatabaseError
}; 