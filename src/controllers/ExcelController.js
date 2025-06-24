const path = require('path');
const fs = require('fs');
const ExcelJS = require('exceljs');
const excelHelper = require('../utils/excelHelper');
const User = require('../models/User');
const applyPopupToSheet = require('../middlewares/excelPopupMiddleware');
const Res = require('../utils/Res'); // ✅ Add this line

// Download as buffer
const exportUserExcel = async (req, res, next) => {
  try {
    const users = await User.findAll();
    const buffer = await excelHelper.generateUserExcelBuffer(users);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="users.xlsx"');
    return res.send(buffer);
  } catch (err) {
    return Res.error(res, 'Failed to export Excel');
  }
};

// Save Excel to disk
const writeUserExcelFile = async (req, res, next) => {
  try {
    const users = await User.findAll();
    const buffer = await excelHelper.generateUserExcelBuffer(users);

    const exportDir = path.join(__dirname, '../../files/exports');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    const filePath = path.join(exportDir, 'users.xlsx');
    fs.writeFileSync(filePath, buffer);

    return Res.success(res, 'Excel file saved successfully!', { path: filePath });
  } catch (err) {
    return Res.error(res, 'Failed to save Excel file');
  }
};

// Inject popup and return modified Excel
const uploadAndInjectPopup = async (req, res, next) => {
  try {
    if (!req.file || !req.file.buffer) {
      return Res.error(res, 'No file uploaded or invalid format', 400);
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);

    const sheet = workbook.getWorksheet(1);
    applyPopupToSheet(sheet);

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="popup_modified.xlsx"');
    return res.send(buffer);
  } catch (error) {
    return Res.error(res, 'Failed to process and return modified Excel');
  }
};

module.exports = {
  exportUserExcel,
  writeUserExcelFile,
  uploadAndInjectPopup
};
