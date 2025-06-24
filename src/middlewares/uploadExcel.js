// middleware/uploadExcel.js
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../files');
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `uploaded-${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage: storage });
module.exports = upload;
