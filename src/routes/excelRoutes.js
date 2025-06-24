const express = require('express');
const router = express.Router();
const excelController = require('../controllers/ExcelController');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() }); // ✅ explicit buffer

router.get('/export-users', excelController.exportUserExcel);
router.post('/write-users-excel', excelController.writeUserExcelFile);
// Upload Excel → inject popup → send modified buffer
router.post('/upload-popup', upload.single('file'), excelController.uploadAndInjectPopup);



module.exports = router;
