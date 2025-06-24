const PDFDocument = require('pdfkit');
const moment = require('moment');

exports.createPdfFromUserData = (userData) => {
  const doc = new PDFDocument({ margin: 30, size: 'A3', layout: 'landscape' });

  doc.fontSize(16).text('User Table Report', { align: 'center' });
  doc.moveDown(1);

  // ✅ Define startX
  const startX = 50;


  // Define compact X positions
  const positions = {
    id: startX,
    name: startX + 40,
    email: startX + 120,
    gender: startX + 260,
    createdAt: startX + 320,
    updatedAt: startX + 410,
    menuIds: startX + 500
  };
  

  const rowHeight = 20;
  let currentY = doc.y;

  // Header row
  doc.fontSize(10).font('Helvetica-Bold');
  doc.text('ID', positions.id, currentY);
  doc.text('Name', positions.name, currentY);
  doc.text('Email', positions.email, currentY);
  doc.text('Gender', positions.gender, currentY);
  doc.text('Created At', positions.createdAt, currentY);
  doc.text('Updated At', positions.updatedAt, currentY);
  doc.text('Menu IDs', positions.menuIds, currentY);

  // Divider line
  currentY += 10;
  doc.moveTo(30, currentY).lineTo(750, currentY).stroke();

  // Data rows
  doc.font('Helvetica').fontSize(10);
  currentY += 5;

  userData.forEach((user) => {
    doc.text(user.id?.toString() || '-', positions.id, currentY);
    doc.text(user.name || '-', positions.name, currentY);
    doc.text(user.email || '-', positions.email, currentY);
    doc.text(user.gender || '-', positions.gender, currentY);
    doc.text(moment(user.createdAt).format('YYYY-MM-DD'), positions.createdAt, currentY);
    doc.text(moment(user.updatedAt).format('YYYY-MM-DD'), positions.updatedAt, currentY);
    const menuText = Array.isArray(user.menuIds) ? user.menuIds.join(', ') : '-';
    doc.text(menuText, positions.menuIds, currentY);

    currentY += rowHeight; // Move to next row
  });

  doc.end();
  return doc;
};
