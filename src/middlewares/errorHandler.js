// middlewares/errorHandler.js
const MessageConstant = require("../constants/MessageConstant");
const ApiResponse = require("../utils/ApiResponse");

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message =
    err.message || MessageConstant.SOMETHING_WENT_WRONG || "Something went wrong";

  // 🚨 Agar SSE request hai (EventStream), to json mat bhejo
  if (req.headers.accept && req.headers.accept.includes("text/event-stream")) {
    if (!res.writableEnded) {
      res.write(
        `data: ${JSON.stringify({
          status: "error",
          code: statusCode,
          description: message,
        })}\n\n`
      );
    }
    return; // yahin exit
  }

  // Normal REST APIs ke liye
  if (!res.headersSent) {
    return res
      .status(statusCode)
      .json(ApiResponse.error(null, statusCode, message));
  }
};

module.exports = errorHandler;
