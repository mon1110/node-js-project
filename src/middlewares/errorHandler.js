// middlewares/errorHandler.js
const MessageConstant = require("../constants/MessageConstant");
const ApiResponse = require("../utils/ApiResponse");

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong";

  res.status(statusCode).json({
    data: [], // Always empty array
    status: {
      status: "error",
      code: statusCode,
      description: message, // Message from MessageConstant
    },
  });
};


module.exports = errorHandler;
