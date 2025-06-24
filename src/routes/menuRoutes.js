const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');

// Get all menus with associated users
router.get('/menus-users', menuController.getMenusWithUsers);

// Filter menus
router.post('/filter', menuController.getMenus);
//router.get('/all', userController.getUserById);

// Search menus by name (using letter filter)
router.post('/search', menuController.getMenusByNameLetter);

// Create a new menu item
router.post('/add', menuController.createMenu);

// Get a menu item by ID
router.get('/all', menuController.getMenuById);

// Update a menu item by ID
router.put('/:id', menuController.updateMenu);

// Soft delete a menu item by ID
router.delete('/:id', menuController.deleteMenu);

// Get paginated menus
router.post('/menus/paginate', menuController.getPaginatedMenus);

//router.post('/search-email', userController.getUsersByEmailLetter);

module.exports = router;
