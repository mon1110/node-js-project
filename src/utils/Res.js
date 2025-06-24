class Res {
    static success(res, message = 'Success', data = {}, statusCode = 200) {
      return res.status(statusCode).json({
        success: true,
        message,
        data
      });
    }
  
    static error(res, message = 'Something went wrong', error = {}, statusCode = 500) {
      return res.status(statusCode).json({
        success: false,
        message,
        error
      });
    }
  
    static created(res, message = 'Resource created successfully', data = {}) {
      return this.success(res, message, data, 201);
    }
  
    static badRequest(res, message = 'Bad Request', error = {}) {
      return this.error(res, message, error, 400);
    }
  
    static unauthorized(res, message = 'Unauthorized', error = {}) {
      return this.error(res, message, error, 401);
    }
  
    static notFound(res, message = 'Resource not found', error = {}) {
      return this.error(res, message, error, 404);
    }
  }
  
  module.exports = Res;
  