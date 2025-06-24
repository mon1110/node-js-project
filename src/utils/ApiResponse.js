class ApiResponse {
    static success(data = {}, message = 'Success', code = 200) {
      return {
        data,
        status: {
          status: 'success',
          code,
          description: message
        }
      };
    }
  
    static error(message = 'Something went wrong', code = 500, data = {}) {
      return {
        data,
        status: {
          status: 'error',
          code,
          description: message
        }
      };
    }
  }
  
  module.exports = ApiResponse;
  