const express = require('express');
const router = express.Router();
//const userController = require('../controllers/productController');
const productController = require('../controllers/productController');

router.get('/products-users', productController.getProductsWithUsers);

//router.post('/page',productController.getProducts)
router.post('/filter', productController.getProducts);


router.post('/search', productController.getproductByEmailLetter);

//router.get('/all', userController.getUserById);

// Create a new user
router.post('/add', productController.createproduct);

// Get a user by ID
router.get('/all', productController.getproductById);

// // Update a user by ID
router.put('/:id', productController.updateproduct);

// // Delete a user by ID
router.delete('/:id', productController.deleteproduct);


router.get('/products', productController.getProducts);

// router.get('/',productController.getUsersOffset)
//router.post('/page', productController.getPaginatedProducts);
router.post('/products/paginate', productController.getPaginatedProducts);

module.exports = router;


