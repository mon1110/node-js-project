// src/tests/userController.test.js

// Mock db.config to fix db.define error
jest.mock('../config/db.config', () => {
    return {
      define: jest.fn((modelName, attributes, options) => {
        return {
          modelName,
          attributes,
          options,
          hasMany: jest.fn(),
          belongsTo: jest.fn(),
        };
      }),
      authenticate: jest.fn().mockResolvedValue(),
      sync: jest.fn().mockResolvedValue(),
      close: jest.fn().mockResolvedValue(),
    };
  });
  
  // Mock models to avoid association errors
  jest.mock('../models/User', () => {
    class MockUser {
      constructor(data) {
        this.data = data;
      }
      get() {
        return this.data || {};
      }
      toJSON() {
        const values = { ...this.get() };
        delete values.password;
        return values;
      }
    }
    MockUser.create = jest.fn();
    MockUser.findOne = jest.fn();
    MockUser.update = jest.fn();
    MockUser.findAll = jest.fn();
    MockUser.hasMany = jest.fn();
    MockUser.belongsTo = jest.fn();
    return MockUser;
  });
  
  jest.mock('../models/product', () => {
    class MockProduct {}
    MockProduct.hasMany = jest.fn();
    MockProduct.belongsTo = jest.fn();
    return MockProduct;
  });
  
  jest.mock('../models/menu', () => {
    class MockMenu {}
    MockMenu.hasMany = jest.fn();
    MockMenu.belongsTo = jest.fn();
    return MockMenu;
  });
  
  jest.mock('../models/Settings', () => {
    return {};
  });
  
  // Now import controller and services after mocks
  const userController = require('../controllers/UserController');
  const userService = require('../Service/userService');
  const Res = require('../utils/Res');
  
  jest.mock('../Service/userService');
  jest.mock('../utils/Res');
  
  describe('userController', () => {
    let req, res, next;
  
    beforeEach(() => {
      req = { body: {}, params: {}, user: {} };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      next = jest.fn();
  
      jest.clearAllMocks();
    });
  
    describe('createUser', () => {
      it('should call userService.createUser and return success', async () => {
        req.body = { name: 'test' };
        req.user = { userId: 1 };
        const mockUser = { id: 1, name: 'test', password: 'hashed' };
        userService.createUser.mockResolvedValue(mockUser);
        Res.success.mockImplementation((res, data, msg) => res.json({ data, msg }));
  
        await userController.createUser(req, res, next);
  
        expect(userService.createUser).toHaveBeenCalledWith(req.body, 1);
        expect(Res.success).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({
          data: {
            user: {
              id: 1,
              name: 'test',
            },
          },
          msg: expect.any(String),
        });
      });
  
      it('should call next with error if service throws', async () => {
        const error = new Error('fail');
        userService.createUser.mockRejectedValue(error);
  
        await userController.createUser(req, res, next);
  
        expect(next).toHaveBeenCalledWith(error);
      });
    });
  
    describe('getAllUsers', () => {
      it('should call userService.getAllUsers and return success', async () => {
        const mockUsers = [{ id: 1 }, { id: 2 }];
        userService.getAllUsers.mockResolvedValue(mockUsers);
        Res.success.mockImplementation((res, data, msg) => res.json({ data, msg }));
  
        await userController.getAllUsers(req, res, next);
  
        expect(userService.getAllUsers).toHaveBeenCalled();
        expect(Res.success).toHaveBeenCalledWith(res, mockUsers, expect.any(String));
        expect(res.json).toHaveBeenCalled();
      });
  
      it('should call next with error if service throws', async () => {
        const error = new Error('fail');
        userService.getAllUsers.mockRejectedValue(error);
  
        await userController.getAllUsers(req, res, next);
  
        expect(next).toHaveBeenCalledWith(error);
      });
    });
  
    describe('login', () => {
      it('should call userService.login and return success', async () => {
        req.body = { email: 'test@example.com', password: 'pass' };
        const userData = { id: 1, token: 'token' };
        userService.login.mockResolvedValue(userData);
        Res.success.mockImplementation((res, data, msg) => res.json({ data, msg }));
  
        await userController.login(req, res, next);
  
        expect(userService.login).toHaveBeenCalledWith(req.body);
        expect(Res.success).toHaveBeenCalledWith(res, userData, expect.any(String));
        expect(res.json).toHaveBeenCalled();
      });
  
      it('should call next with error if service throws', async () => {
        const error = new Error('fail');
        userService.login.mockRejectedValue(error);
  
        await userController.login(req, res, next);
  
        expect(next).toHaveBeenCalledWith(error);
      });
    });
  
    describe('deleteUser', () => {
      it('should return success if deleted', async () => {
        req.params.id = '1';
        userService.deleteUser.mockResolvedValue(true);
        Res.success.mockImplementation((res, data, msg) => res.json({ data, msg }));
  
        await userController.deleteUser(req, res, next);
  
        expect(userService.deleteUser).toHaveBeenCalledWith('1');
        expect(Res.success).toHaveBeenCalledWith(res, null, expect.any(String));
        expect(res.json).toHaveBeenCalled();
      });
  
      it('should return error if not deleted', async () => {
        req.params.id = '1';
        userService.deleteUser.mockResolvedValue(false);
        Res.error.mockImplementation((res, msg, status) => res.status(status).json({ error: msg }));
  
        await userController.deleteUser(req, res, next);
  
        expect(Res.error).toHaveBeenCalledWith(res, expect.any(String), 404);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalled();
      });
  
      it('should call next on error', async () => {
        const error = new Error('fail');
        userService.deleteUser.mockRejectedValue(error);
  
        await userController.deleteUser(req, res, next);
  
        expect(next).toHaveBeenCalledWith(error);
      });
    });
  });
  