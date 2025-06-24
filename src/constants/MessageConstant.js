// src/utils/MessageConstant.js

module.exports = {
  USER: {
    CREATE_SUCCESS: "User created successfully",
    UPDATE_SUCCESS: "User updated successfully",
    DELETE_SUCCESS: "User deleted successfully",
    FETCH_SUCCESS: "User(s) fetched successfully",
    NOT_FOUND: "User not found",
    EMAIL_EXISTS: "Email already exists",
    INVALID_ID: "Invalid user ID",
    INVALID_EMAIL_OR_PASSWORD: "Invalid email or password",
    ALL_FIELDS_REQUIRED: "All fields are required",
    CREATE_FAILED: "Failed to create user",
    FETCH_FAILED: "Failed to fetch users",
  },

  AUTH: {
    LOGIN_SUCCESS: "Login successful",
    INVALID_CREDENTIALS: "Invalid email or password",
    UNAUTHORIZED: "Unauthorized access",
    TOKEN_REQUIRED: "Token is required",
    INVALID_TOKEN: "Invalid or expired token",
  },

  COMMON: {
    SERVER_ERROR: "Internal Server Error",
    BAD_REQUEST: "Bad Request",
    FORBIDDEN: "Forbidden",
    VALIDATION_FAILED: "Validation failed",
    INTERNAL_ERROR: "Something went wrong",
    VALIDATION_ERROR: "Validation failed",
  }
};
