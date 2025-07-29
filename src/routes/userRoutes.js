const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');
const { fetchAllUsers } = require('../controllers/UserController');
const authenticateToken = require('../middlewares/authMiddleware');
const { registerUser } = require('../controllers/UserController');
const jwtMiddleware = require('../middlewares/jwtMiddleware');

router.get('/users/by-token', jwtMiddleware, userController.getUsersByToken);

router.get('/records', jwtMiddleware, userController.getRecordsByUser);

router.all('/external-api',userController.processExternalApi); 

router.post('/bulk-insert', userController.bulkInsertUsers);

//nodemailer ke liye
router.get("/node", userController.getAllUsers);
// router.get('/posts', userController.getAllPosts);

//joining
router.post('/users-menu', userController.getUsersWithmenu);

router.post('/paginate', userController.paginateUsersWithMenus);

router.post('/search-email', userController.getUsersByEmailLetter);

router.post('/assign-menus', userController.assignMenusToUser);

router.get('/email', userController.findByEmail);


//pagination
router.post('/get-users', userController.getUsers);


// Create a new user
router.post('/register', jwtMiddleware, userController.createUser);

//custom error ke liye ye use hoga
router.get('/:id', userController.getUserById);

router.post('/login', userController.login);
// router.get('/users', userController.getUser);

//update password
router.post('/users/update-password', userController.updateUserPassword);



// // Get a user by ID
router.get('/:id', authenticateToken, userController.getUserById);

// // Update a user by ID
router.put('/:id', authenticateToken, userController.updateUser);

// // Delete a user by ID
router.delete('/:id', authenticateToken, userController.deleteUser);

 router.post('/by-ids', userController.getUsersByIds);


 //upsert
 router.post('/upsert-user', userController.upsertUser);

//bulk
// router.post('/users/bulk', userController.bulkCreateUserHandler);

//single api
router.post("/save", userController.saveUser);

//RMQ ke liye
router.post('/registeraaa', userController.registerUser); 



//swagger
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/', (req, res) => {
    res.status(200).json([
      { id: 1, name: 'aaa bbb Updated', email: 'xyzabdc@gmail.com', menuIds : [3]},
    ]);
  });
  //swagger ke liye
  router.get('/', userController.fetchAllUsers);

module.exports = router;

