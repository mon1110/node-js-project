module.exports = function applyPopupToSheet(sheet) {
    const startRow = 2;
    const endRow = sheet.rowCount;
  
    for (let row = startRow; row <= endRow; row++) {
      sheet.getCell(`B${row}`).dataValidation = {
        type: 'textLength',
        operator: 'greaterThan',
        showInputMessage: true,
        promptTitle: 'Name',
        prompt: 'Enter full name.'
      };
  
      sheet.getCell(`C${row}`).dataValidation = {
        type: 'textLength',
        operator: 'greaterThan',
        showInputMessage: true,
        promptTitle: 'Email',
        prompt: 'Enter email address.'
      };
  
      sheet.getCell(`D${row}`).dataValidation = {
        type: 'date',
        showInputMessage: true,
        promptTitle: 'Created At',
        prompt: 'Enter created date.'
      };
  
      sheet.getCell(`E${row}`).dataValidation = {
        type: 'date',
        showInputMessage: true,
        promptTitle: 'Updated At',
        prompt: 'Enter updated date.'
      };
    }
  };
  