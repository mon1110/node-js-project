const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

exports.readExcel = async (filePath) => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.worksheets[0];

  const data = [];
  worksheet.eachRow((row, rowNumber) => {
    data.push(row.values.slice(1)); // Remove first blank element
  });

  return data;
};

exports.writeExcel = async () => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('User Report');

  worksheet.columns = [
    { header: 'ID', key: 'id', width: 10 },
    { header: 'Name', key: 'name', width: 20 },
    { header: 'Email', key: 'email', width: 25 },
    { header: 'Gender', key: 'gender', width: 10 },
    { header: 'Created At', key: 'createdAt', width: 20 },
  ];

  const sampleData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', gender: 'Male', createdAt: '2024-06-01' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', gender: 'Female', createdAt: '2024-06-05' },
  ];

  sampleData.forEach((data) => worksheet.addRow(data));

  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true };
    cell.alignment = { horizontal: 'center' };
  });

  const filePath = path.join(__dirname, '../../files/user-report.xlsx');
  await workbook.xlsx.writeFile(filePath);

  return filePath;
};
