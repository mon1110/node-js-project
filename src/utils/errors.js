// src/utils/errors.js

class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

class BadRequestException extends Error {
  constructor(message) {
    super(message);
    this.name = "BadRequestException";
    this.statusCode = 400;
  }
}


class NotFoundException extends ApiError {
  constructor(message = "Not Found") {
    super(message, 404);
  }
}

class UnauthorizedException extends ApiError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

class ForbiddenException extends ApiError {
  constructor(message = "Forbidden") {
    super(message, 403);
  }
}

class ConflictException extends ApiError {
  constructor(message = "Conflict") {
    super(message, 409);
  }
}

class UnprocessableEntityException extends ApiError {
  constructor(message = "Unprocessable Entity") {
    super(message, 422);
  }
}

class InternalServerErrorException extends ApiError {
  constructor(message = "Internal Server Error") {
    super(message, 500);
  }
}

module.exports = {
  ApiError,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
  ConflictException,
  UnprocessableEntityException,
  InternalServerErrorException
};
