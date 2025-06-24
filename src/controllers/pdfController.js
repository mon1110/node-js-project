const pdfService = require('../Service/pdfService'); 
const Res = require('../utils/Res');
const pdf = require('pdf-parse');

exports.generatePdf = async (req, res) => {
  try {
    const filePath = await pdfService.generatePdf();
    return res.download(filePath); // triggers file download
  } catch (err) {
    return Res.error(res, 'Failed to generate PDF', err.message, 500);
  }
};

exports.readPdf = async (req, res) => {
  try {
    const stream = await pdfService.readPdf();
    return stream.pipe(res); // send as stream
  } catch (err) {
    return Res.error(res, 'Failed to read PDF', err.message, 500);
  }
};

exports.extractUsersFromPdf = async (req, res) => {
  try {
    const buffer = req.file?.buffer;
    if (!buffer) return Res.error(res, 'No file buffer received', null, 400);

    const data = await pdf(buffer);
    const lines = data.text.split('\n').map(line => line.trim()).filter(Boolean);

    const users = lines.slice(2).reduce((acc, line) => {
      const match = line.match(
        /^(\d+)?\s*([A-Za-z\s]+)?\s*([\w.+-]+@[\w.-]+\.[a-zA-Z]{2,})\s*(MALE|FEMALE|-)?\s*(\d{4}-\d{2}-\d{2})\s*(\d{4}-\d{2}-\d{2})\s*([\d,\s]*)?$/
      );

      if (!match) return acc;

      const [, id, name, email, gender, createdAt, updatedAt, menu] = match;

      const menuIds = (menu || '')
        .split(',')
        .map(m => m.trim())
        .filter(m => /^\d+$/.test(m));

      const user = {
        ...(id && { id }),
        name: name?.trim() || '',
        email: email.trim(),
        ...(gender && { gender: gender.trim() }),
        createdAt,
        updatedAt,
        menuIds
      };

      return [...acc, user];
    }, []);

    if (!users.length) {
      return Res.error(res, 'No valid user data found in PDF', null, 404);
    }

    return Res.success(res, 'PDF parsed successfully', users);
  } catch (err) {
    console.error('PDF parse error:', err);
    return Res.error(res, 'Failed to parse PDF', err.message, 500);
  }
};
