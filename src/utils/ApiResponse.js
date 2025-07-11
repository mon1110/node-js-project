class ApiResponse {
  static success(data = {}, message = 'Success') {
    return {
      success: true,
      description: {
        message,
        ...data 
      }
    };
  }

  static error(message = 'Something went wrong', code = 500, data = {}) {
    return {
      success: false,
      description: {
        message,
        ...data && { data }
      }
    };
  }
}

module.exports = ApiResponse;
