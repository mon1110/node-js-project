const express = require('express');
const router = express.Router();
const fileController = require('../controllers/FileController');
const multer = require('multer');

const upload = multer({ dest: 'files/' });

router.post('/read-excel', upload.single('file'), fileController.readExcel);
router.get('/write-excel', fileController.writeExcel);

module.exports = router;
