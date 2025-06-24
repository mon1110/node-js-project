const fs = require('fs');
const path = require('path');
const PdfGenerator = require('../utils/PdfGenerator');
const User = require('../models/User'); // Adjust path if needed
const { readPdfUsersAsArray } = require('../utils/pdfReader');

const filePath = path.join(__dirname, '../../files/sample.pdf');

exports.generatePdf = async () => {
    try {
      const users = await User.findAll(); // Fetch data from DB
  
      const doc = PdfGenerator.createPdfFromUserData(users);
      const stream = fs.createWriteStream(filePath);
  
      return new Promise((resolve, reject) => {
        doc.pipe(stream);
        stream.on('finish', () => resolve(filePath));
        stream.on('error', (err) => reject(err));
      });
    } catch (err) {
      throw err;
    }
  };
  
exports.readPdf = () => {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(filePath)) {
      return reject(new Error('PDF file does not exist'));
    }

    const stream = fs.createReadStream(filePath);
    resolve(stream);
  });
};

// exports.getAllUserDataFromPdf = async () => {
//   const filePath = path.join(__dirname, '../../files/sample.pdf'); // adjust as needed
//   return await readPdfUsersAsArray(filePath);
// };
