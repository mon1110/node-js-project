const excelHelper = require('../utils/excelHelper');
const path = require('path');

const ExcelRepository = {
  read(filePath) {
    return excelHelper.readExcel(filePath);
  },

  write(data) {
    const outputPath = path.join(__dirname, '../../data/output.xlsx');
    excelHelper.writeExcel(data, outputPath);
    return outputPath;
  }
};

module.exports = ExcelRepository;
