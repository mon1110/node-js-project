const fileService = require('../service/fileService');
const Res = require('../utils/Res');

exports.readExcel = async (req, res) => {
  try {
    const data = await fileService.readExcel(req.file.path);
    return Res.success(res, 'Excel read successfully', data);
  } catch (error) {
    return Res.error(res, 'Failed to read Excel');
  }
};

exports.writeExcel = async (req, res) => {
  try {
    const filePath = await fileService.writeExcel();
    return res.download(filePath); // download = direct response, not wrapped in JSON
  } catch (error) {
    return Res.error(res, 'Failed to write Excel');
  }
};
