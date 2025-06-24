const excelHelper = require('../utils/excelHelper');
const User = require('../models/User');

const excelService = {
  async getUserExcelBuffer() {
    const users = await User.findAll({ raw: true });
    const buffer = await excelHelper.generateUserExcelBuffer(users);
    return buffer;
  }
};

module.exports = excelService;
