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
// class ApiResponse {
//   constructor(code, message, data = null) {
//     this.status = {
//       status: code >= 200 && code < 300 ? 'success' : 'error',
//       code,
//       description: message,
//     };
//     this.data = data;
//   }
// }



module.exports = ApiResponse;
