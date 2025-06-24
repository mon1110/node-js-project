const fs = require('fs');
const pdfParse = require('pdf-parse');

exports.readPdfUsersAsArray = async (filePath) => {
  if (!fs.existsSync(filePath)) {
    throw new Error('PDF file not found at ' + filePath);
  }

  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  console.log('Extracted PDF Text:', data.text);

  const lines = data.text.split('\n').map(line => line.trim()).filter(Boolean);
  console.log('Lines:', lines);

  const users = [];
  let currentUser = {};

  lines.forEach(line => {
    if (line.startsWith('ID:')) {
      if (Object.keys(currentUser).length > 0) {
        users.push(currentUser);
        currentUser = {};
      }
      currentUser.id = line.replace('ID:', '').trim();
    } else if (line.startsWith('Name:')) {
      currentUser.name = line.replace('Name:', '').trim();
    } else if (line.startsWith('Email:')) {
      currentUser.email = line.replace('Email:', '').trim();
    }
  });

  if (Object.keys(currentUser).length > 0) {
    users.push(currentUser);
  }

  console.log('Parsed Users:', users);
  return users;
};
