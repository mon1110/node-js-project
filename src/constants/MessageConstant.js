// src/utils/MessageConstant.js

module.exports = {
  USER: {
    CREATE_SUCCESS: "User created successfully",
    UPDATE_SUCCESS: "User updated successfully",
    DELETE_SUCCESS: "User deleted successfully",
    FETCH_SUCCESS: "User(s) fetched successfully",
    PASSWORD_REQUIRED:"password is required",
    UNAUTHORISED:"unauthorized",
    INVALID_PAYLOAD:"invalid payload",
    ID_REQUIRED:"id is required",
    FETCH_FAILED: "Failed to fetch users",
    NOT_FOUND: "User not found",
    EMAIL_EXISTS: "Email already exists",
    INVALID_ID: "Invalid user ID",
    INVALID_EMAIL_OR_PASSWORD: "Invalid email or password",
    ALL_FIELDS_REQUIRED: "All fields are required",
    CREATE_FAILED: "Failed to create user",
    EVENT_SEND_SUCESSFULLY:"event sned successfully",
    KEY_NOT_CONNECTED:"key not connected",
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
    METHOD_AND_URL_REQUIRED:"method and url required",
    INVALID_METHOD:"invalid method",
    LOGIN_SUCCESS: "Login successful",
    INVALID_CREDENTIALS: "Invalid credentials.",
    EMAIL_REQUIRED: "Email required",
    BLOCKED: "User blocked, try again later",
    EXTERNAL_API_ERROR: "External API error",
    URL_IS_REQUIRED: "URL required",
    INDEX_CREATED_SUCCESS: "Index created successfully",
    INDEX_CREATION_FAILED: "Index creation failed",
    UNAUTHORIZED: "Unauthorized, token missing",
    AUTHORIZED_USER_BY_TOKEN: "User fetched successfully by token owner",
    // BLOCKED_WITH_TIMER:"blockedWithTimer",
    RETRY_ATTEMPT_FAILED: (attempt) => `Attempt ${attempt} failed. Please retry.`,
    invalidCredentialWithCount: (attempt, max) =>
      `Invalid email or password. Attempt ${attempt}/${max}`,
      BLOCKED_WITH_TIMER: (minutes) => `Account is blocked. Try again in ${minutes} minute(s).`,
      INVALID_CREDENTIAL_WITH_COUNT: (count, max) =>
        `Invalid credentials. Attempt ${count}/${max}`,
  
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
  },

  REQUEST: {
    FAILED: "Request failed due to network error.",
  },
};
