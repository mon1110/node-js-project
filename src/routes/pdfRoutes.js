const express = require('express');
const router = express.Router();
const pdfController = require('../controllers/pdfController');
const multer = require('multer');

// Memory storage (no saving to disk)
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/generate', pdfController.generatePdf);
router.get('/read', pdfController.readPdf);

router.post('/pdf/users', upload.single('file'), pdfController.extractUsersFromPdf);

module.exports = router;
