// // src/utils/errors.js

// class ApiError extends Error {
//   constructor(message, statusCode) {
//     super(message);
//     this.statusCode = statusCode;
//     Error.captureStackTrace(this, this.constructor);
//   }
// }

// class BadRequestException extends Error {
//   constructor(message) {
//     super(message);
//     this.name = "BadRequestException";
//     this.statusCode = 400;
//   }
// }


// class NotFoundException extends ApiError {
//   constructor(message = "Not Found") {
//     super(message, 404);
//   }
// }

// class UnauthorizedException extends ApiError {
//   constructor(message = "Unauthorized") {
//     super(message, 401);
//   }
// }

// class ForbiddenException extends ApiError {
//   constructor(message = "Forbidden") {
//     super(message, 403);
//   }
// }

// class ConflictException extends ApiError {
//   constructor(message = "Conflict") {
//     super(message, 409);
//   }
// }

// class UnprocessableEntityException extends ApiError {
//   constructor(message = "Unprocessable Entity") {
//     super(message, 422);
//   }
// }

// class InternalServerErrorException extends ApiError {
//   constructor(message = "Internal Server Error") {
//     super(message, 500);
//   }
// }

// module.exports = {
//   ApiError,
//   BadRequestException,
//   NotFoundException,
//   UnauthorizedException,
//   ForbiddenException,
//   ConflictException,
//   UnprocessableEntityException,
//   InternalServerErrorException
// };

const { StatusCodes, ReasonPhrases } = require('http-status-codes');

class ApiError extends Error {
  constructor(message = ReasonPhrases.INTERNAL_SERVER_ERROR, statusCode = StatusCodes.INTERNAL_SERVER_ERROR) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

class BadRequestException extends ApiError {
  constructor(message = ReasonPhrases.BAD_REQUEST) {
    super(message, StatusCodes.BAD_REQUEST);
  }
}

class NotFoundException extends ApiError {
  constructor(message = ReasonPhrases.NOT_FOUND) {
    super(message, StatusCodes.NOT_FOUND);
  }
}

class UnauthorizedException extends ApiError {
  constructor(message = ReasonPhrases.UNAUTHORIZED) {
    super(message, StatusCodes.UNAUTHORIZED);
  }
}

class ForbiddenException extends ApiError {
  constructor(message = ReasonPhrases.FORBIDDEN) {
    super(message, StatusCodes.FORBIDDEN);
  }
}

class ConflictException extends ApiError {
  constructor(message = ReasonPhrases.CONFLICT) {
    super(message, StatusCodes.CONFLICT);
  }
}

class UnprocessableEntityException extends ApiError {
  constructor(message = ReasonPhrases.UNPROCESSABLE_ENTITY) {
    super(message, StatusCodes.UNPROCESSABLE_ENTITY);
  }
}

class InternalServerErrorException extends ApiError {
  constructor(message = ReasonPhrases.INTERNAL_SERVER_ERROR) {
    super(message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

class ProcessingErrorException extends ApiError {
  constructor(message = ReasonPhrases.PROCESSING) {
    super(message, StatusCodes.PROCESSING);
  }
}

class LockedrrorException extends ApiError {
  constructor(message = ReasonPhrases.LOCKED) {
    super(message, StatusCodes.LOCKED);
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
  InternalServerErrorException,
  ProcessingErrorException,
  LockedrrorException
};
