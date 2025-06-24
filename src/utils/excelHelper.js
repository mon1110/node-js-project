const ExcelJS = require('exceljs');
const applyPopupToSheet = require('../middlewares/excelPopupMiddleware'); // 👈 correct relative path

const excelHelper = {
  async generateUserExcelBuffer(data) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Users');

    const headers = ['sr no.', 'name', 'email', 'createdAt', 'updatedAt'];
    const headerRow = headers.map(h => h.toUpperCase());
    sheet.addRow(headerRow);

    // Style Header
    const header = sheet.getRow(1);
    header.eachCell(cell => {
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD3D3D3' },
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Add Data Rows
    data.forEach((item, index) => {
      const rowData = headers.map(key => {
        const lowerKey = key.toLowerCase();

        if (lowerKey === 'sr no.') return index + 1;

        if (lowerKey === 'createdat' || lowerKey === 'updatedat') {
          return item[key] ? new Date(item[key]) : null;
        }

        return item[key] !== undefined ? item[key] : null;
      });

      const row = sheet.addRow(rowData);

      const bgColor = index % 2 === 0 ? 'FFFFFFFF' : 'FFF2F2F2';

      row.eachCell((cell, colNumber) => {
        const colKey = headers[colNumber - 1].toLowerCase();

        // Apply date formatting to createdAt and updatedAt
        if (colKey === 'createdat' || colKey === 'updatedat') {
          cell.numFmt = 'dd-mm-yyyy';
        }

        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: bgColor },
        };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
        cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
      });
    });

    // Auto-fit column widths based on content
    sheet.columns.forEach((column, index) => {
      const headerKey = headers[index]?.toLowerCase() || '';
      let maxLength = headerKey.length;

      column.eachCell({ includeEmpty: true }, cell => {
        const value = cell.value;

        if ((headerKey === 'createdat' || headerKey === 'updatedat') && value instanceof Date) {
          maxLength = Math.max(maxLength, 10); // for 'dd-mm-yyyy'
        } else {
          const str = value ? value.toString() : '';
          maxLength = Math.max(maxLength, str.length);
        }
      });

      column.width = maxLength + 2;
    });

    return await workbook.xlsx.writeBuffer();
  }
};

module.exports = excelHelper;
