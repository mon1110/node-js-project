
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const storage = multer.diskStorage({
    // destination: function (req, file, cb) {
    //   try {
    //     const uploadDir = path.join(__dirname, '../../files/sample'); // ✅ Fixed path
    //     if (!fs.existsSync(uploadPath)) {
    //       fs.mkdirSync(uploadPath, { recursive: true });
    //     }
    //     cb(null, uploadPath);
    //   } catch (err) {
    //     console.error('❌ Error in destination:', err.message);
    //     cb(err);
    //   }
    // },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    }
  });
  
  const upload = multer({ storage });
  
  
module.exports = upload;
