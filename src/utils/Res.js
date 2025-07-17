class Res {
  static success(res, data = {}, description = 'Success', statusCode = 200, token = null) {
    return res.status(statusCode).json({
      data,
      ...(token && { token }),
      status: {
        status: "ok",
        code: statusCode,
        description
      }
    });
  }

  static error(res, description = 'Something went wrong', data = {}, statusCode = 500) {
    return res.status(statusCode).json({
      data,
      status: {
        status: "error",
        code: statusCode,
        description
      }
    });
  }

  static created(res, data = {}, description = 'Created') {
    return this.success(res, data, description, 201);
  }

  static badRequest(res, description = 'Bad Request', data = {}) {
    return this.error(res, description, data, 400);
  }

  static unauthorized(res, description = 'Unauthorized', data = {}) {
    return this.error(res, description, data, 401);
  }

  static notFound(res, description = 'Not Found', data = {}) {
    return this.error(res, description, data, 404);
  }

  static sendResponse(res, apiResponse) {
    return res.status(apiResponse.status.code).json(apiResponse);
  }


  static noContent(res, description = 'No Content') {
    return res.status(204).json({
      data: {},
      status: {
        status: "ok",
        code: 204,
        description
      }
    });
  }
}

module.exports = Res;
