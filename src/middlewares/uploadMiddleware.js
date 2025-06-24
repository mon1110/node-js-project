// ✅ Correct Order
const multer = require('multer');
const fs = require('fs');
const path = require('path');
// const storage = multer.memoryStorage(); // <-- explicitly use memory


// ✅ multer used after importing it
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../files/sample');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

module.exports = upload;
