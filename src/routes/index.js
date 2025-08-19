const express = require('express');
const router = express.Router();
// const userController = require('../controllers/UserController');

const userRoutes = require('./userRoutes');
// Create a new user
 router.use('/users',userRoutes);
//  router.use('/sse', userRoutes);



 const productRoutes = require('./productRoutes');
 //create a new product
 router.use('/product',productRoutes);


 const menuRoutes = require('./menuRoutes');
 //create a new product
 router.use('/menu',menuRoutes);

 const fileRoutes = require('./fileRoutes');
 //create a new file
 router.use('/file',fileRoutes);

 const excelRoutes = require('./excelRoutes');
 //create a new file
 router.use('/excel',excelRoutes);
 

 const pdfRoutes = require('./pdfRoutes');
 router.use('/pdf',pdfRoutes);
 

  module.exports = router;