// src/utils/MessageConstant.js

module.exports = {
  USER: {
    CREATE_SUCCESS: "User created successfully",
    UPDATE_SUCCESS: "User updated successfully",
    DELETE_SUCCESS: "User deleted successfully",
    FETCH_SUCCESS: "User(s) fetched successfully",
    FETCH_FAILED: "Failed to fetch posts",
    NOT_FOUND: "User not found",
    EMAIL_EXISTS: "Email already exists",
    INVALID_ID: "Invalid user ID",
    INVALID_EMAIL_OR_PASSWORD: "Invalid email or password",
    ALL_FIELDS_REQUIRED: "All fields are required",
    CREATE_FAILED: "Failed to create user",
    FETCH_FAILED: "Failed to fetch users",
    IDS_FETCH_SUCCESS: "Users fetched by IDs successfully",
    EMAIL_START_SUCCESS: "Users fetched by email prefix successfully",
    ASSIGN_MENUS_SUCCESS: "Menus assigned to user successfully",
    PAGINATION_SUCCESS: "Users fetched with pagination successfully",
    JOIN_FETCH_SUCCESS: "Users with menus fetched successfully",
    UPSERT_SUCCESS: "User upserted successfully",
    BULK_SAVE_SUCCESS: "Users saved in bulk successfully",
    FETCH_ALL_SUCCESS: "All users fetched successfully",
    EMAIL_FOUND: "User found by email",
    PASSWORD_UPDATE_SUCCESS: "Password updated successfully",
    LOGIN_SUCCESS: "Login successful",
    INVALID_CREDENTIALS: "Invalid credentials.",
    EMAIL_REQUIRED:"email required",
    BLOCKED:"user blocked try again leter",
    EXTERNAL_API_ERROR: 'External API Error',
    URL_IS_REQUIRED: 'Url Required',
    EXTERNAL_API_ERROR:'external api error',
    INDEX_CREATED_SUCCESS:'index created',
    INDEX_CREATION_FAILED:'index failed',
    RETRY_ATTEMPT_FAILED: (attempt) => `Attempt ${attempt} failed. Please retry.`,
    invalidCredentialWithCount: (attempts, max) => `Invalid credentials. (${attempts}/${max})`,
    blockedWithTimer: (minutes) => `Account is blocked. Try again in ${minutes} minute(s).`

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
