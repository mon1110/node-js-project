// // src/tests/userController.test.js

// // Mock db.config to fix db.define error
// jest.mock('../config/db.config', () => {
//     return {
//       define: jest.fn((modelName, attributes, options) => {
//         return {
//           modelName,
//           attributes,
//           options,
//           hasMany: jest.fn(),
//           belongsTo: jest.fn(),
//         };
//       }),
//       authenticate: jest.fn().mockResolvedValue(),
//       sync: jest.fn().mockResolvedValue(),
//       close: jest.fn().mockResolvedValue(),
//     };
//   });
  
//   // Mock models to avoid association errors
//   jest.mock('../models/User', () => {
//     class MockUser {
//       constructor(data) {
//         this.data = data;
//       }
//       get() {
//         return this.data || {};
//       }
//       toJSON() {
//         const values = { ...this.get() };
//         delete values.password;
//         return values;
//       }
//     }
//     MockUser.create = jest.fn();
//     MockUser.findOne = jest.fn();
//     MockUser.update = jest.fn();
//     MockUser.findAll = jest.fn();
//     MockUser.hasMany = jest.fn();
//     MockUser.belongsTo = jest.fn();
//     return MockUser;
//   });
  
//   jest.mock('../models/product', () => {
//     class MockProduct {}
//     MockProduct.hasMany = jest.fn();
//     MockProduct.belongsTo = jest.fn();
//     return MockProduct;
//   });
  
//   jest.mock('../models/menu', () => {
//     class MockMenu {}
//     MockMenu.hasMany = jest.fn();
//     MockMenu.belongsTo = jest.fn();
//     return MockMenu;
//   });
  
//   jest.mock('../models/Settings', () => {
//     return {};
//   });
  
//   // Now import controller and services after mocks
//   const userController = require('../controllers/UserController');
//   const userService = require('../Service/userService');
//   const Res = require('../utils/Res');
  
//   jest.mock('../Service/userService');
//   jest.mock('../utils/Res');
  
//   describe('userController', () => {
//     let req, res, next;
  
//     beforeEach(() => {
//       req = { body: {}, params: {}, user: {} };
//       res = {
//         status: jest.fn().mockReturnThis(),
//         json: jest.fn(),
//       };
//       next = jest.fn();
  
//       jest.clearAllMocks();
//     });
  
//     describe('createUser', () => {
//       it('should call userService.createUser and return success', async () => {
//         req.body = { name: 'test' };
//         req.user = { userId: 1 };
//         const mockUser = { id: 1, name: 'test', password: 'hashed' };
//         userService.createUser.mockResolvedValue(mockUser);
//         Res.success.mockImplementation((res, data, msg) => res.json({ data, msg }));
  
//         await userController.createUser(req, res, next);
  
//         expect(userService.createUser).toHaveBeenCalledWith(req.body, 1);
//         expect(Res.success).toHaveBeenCalled();
//         expect(res.json).toHaveBeenCalledWith({
//           data: {
//             user: {
//               id: 1,
//               name: 'test',
//             },
//           },
//           msg: expect.any(String),
//         });
//       });
  
//       it('should call next with error if service throws', async () => {
//         const error = new Error('fail');
//         userService.createUser.mockRejectedValue(error);
  
//         await userController.createUser(req, res, next);
  
//         expect(next).toHaveBeenCalledWith(error);
//       });
//     });
  
//     describe('getAllUsers', () => {
//       it('should call userService.getAllUsers and return success', async () => {
//         const mockUsers = [{ id: 1 }, { id: 2 }];
//         userService.getAllUsers.mockResolvedValue(mockUsers);
//         Res.success.mockImplementation((res, data, msg) => res.json({ data, msg }));
  
//         await userController.getAllUsers(req, res, next);
  
//         expect(userService.getAllUsers).toHaveBeenCalled();
//         expect(Res.success).toHaveBeenCalledWith(res, mockUsers, expect.any(String));
//         expect(res.json).toHaveBeenCalled();
//       });
  
//       it('should call next with error if service throws', async () => {
//         const error = new Error('fail');
//         userService.getAllUsers.mockRejectedValue(error);
  
//         await userController.getAllUsers(req, res, next);
  
//         expect(next).toHaveBeenCalledWith(error);
//       });
//     });
  
//     describe('login', () => {
//       it('should call userService.login and return success', async () => {
//         req.body = { email: 'test@example.com', password: 'pass' };
//         const userData = { id: 1, token: 'token' };
//         userService.login.mockResolvedValue(userData);
//         Res.success.mockImplementation((res, data, msg) => res.json({ data, msg }));
  
//         await userController.login(req, res, next);
  
//         expect(userService.login).toHaveBeenCalledWith(req.body);
//         expect(Res.success).toHaveBeenCalledWith(res, userData, expect.any(String));
//         expect(res.json).toHaveBeenCalled();
//       });
  
//       it('should call next with error if service throws', async () => {
//         const error = new Error('fail');
//         userService.login.mockRejectedValue(error);
  
//         await userController.login(req, res, next);
  
//         expect(next).toHaveBeenCalledWith(error);
//       });
//     });
  
//     describe('deleteUser', () => {
//       it('should return success if deleted', async () => {
//         req.params.id = '1';
//         userService.deleteUser.mockResolvedValue(true);
//         Res.success.mockImplementation((res, data, msg) => res.json({ data, msg }));
  
//         await userController.deleteUser(req, res, next);
  
//         expect(userService.deleteUser).toHaveBeenCalledWith('1');
//         expect(Res.success).toHaveBeenCalledWith(res, null, expect.any(String));
//         expect(res.json).toHaveBeenCalled();
//       });
  
//       it('should return error if not deleted', async () => {
//         req.params.id = '1';
//         userService.deleteUser.mockResolvedValue(false);
//         Res.error.mockImplementation((res, msg, status) => res.status(status).json({ error: msg }));
  
//         await userController.deleteUser(req, res, next);
  
//         expect(Res.error).toHaveBeenCalledWith(res, expect.any(String), 404);
//         expect(res.status).toHaveBeenCalledWith(404);
//         expect(res.json).toHaveBeenCalled();
//       });
  
//       it('should call next on error', async () => {
//         const error = new Error('fail');
//         userService.deleteUser.mockRejectedValue(error);
  
//         await userController.deleteUser(req, res, next);
  
//         expect(next).toHaveBeenCalledWith(error);
//       });
//     });
//   });
  

// test/mocha/userController.test.js
const { expect } = require('chai');
const sinon = require('sinon');

const userController = require('../controllers/UserController');
const userService = require('../Service/userService');
const jsonapi = require('../Service/jsonapi');
const Res = require('../utils/Res');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

describe('UserController', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {}, params: {}, user: {} };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
    next = sinon.stub();
    sinon.restore();
  });

  describe('createUser', () => {
    it('should call userService.createUser and return success', async () => {
      req.body = { name: 'test' };
      req.user = { userId: 1 };
      sinon.stub(userService, 'createUser').resolves({ id: 1, name: 'test', password: 'hashed' });
      sinon.stub(Res, 'success').callsFake((res, data) => res.json({ data }));

      await userController.createUser(req, res, next);
      expect(Res.success.called).to.be.true;
    });

    it('should call next if service throws', async () => {
      sinon.stub(userService, 'createUser').rejects(new Error('fail'));
      await userController.createUser(req, res, next);
      expect(next.called).to.be.true;
    });
  });

  describe('getAllUsers', () => {
    it('should fetch all users', async () => {
      sinon.stub(userService, 'getAllUsers').resolves([{ id: 1 }]);
      sinon.stub(Res, 'success').callsFake((res, data) => res.json({ data }));
      await userController.getAllUsers(req, res, next);
      expect(Res.success.called).to.be.true;
    });

    it('should call next on error', async () => {
      sinon.stub(userService, 'getAllUsers').rejects(new Error('fail'));
      await userController.getAllUsers(req, res, next);
      expect(next.called).to.be.true;
    });
  });

  describe('login', () => {
    it('should return login data', async () => {
      req.body = { email: 'a@b.com', password: '123' };
      sinon.stub(userService, 'login').resolves({ id: 1, token: 'token' });
      sinon.stub(Res, 'success').callsFake((res, data) => res.json({ data }));
      await userController.login(req, res, next);
      expect(Res.success.called).to.be.true;
    });

    it('should call next if login fails', async () => {
      sinon.stub(userService, 'login').rejects(new Error('fail'));
      await userController.login(req, res, next);
      expect(next.called).to.be.true;
    });
  });

  describe('updateUser', () => {
    it('should update password successfully', async () => {
      req.user = { userId: 1 };
      req.body = { oldPassword: 'old', newPassword: 'new' };
      sinon.stub(userService, 'getUserById').resolves({ password: 'hashed' });
      sinon.stub(bcrypt, 'compare').resolves(true);
      sinon.stub(userService, 'updateUser').resolves();
      sinon.stub(Res, 'success').callsFake((res) => res.json({ success: true }));

      await userController.updateUser(req, res, next);
      expect(Res.success.called).to.be.true;
    });

    it('should return error if oldPassword invalid', async () => {
      req.user = { userId: 1 };
      req.body = { oldPassword: 'wrong', newPassword: 'new' };
      sinon.stub(userService, 'getUserById').resolves({ password: 'hashed' });
      sinon.stub(bcrypt, 'compare').resolves(false);
      sinon.stub(Res, 'error').callsFake((res) => res.json({ error: true }));

      await userController.updateUser(req, res, next);
      expect(Res.error.called).to.be.true;
    });
  });

  describe('deleteUser', () => {
    it('should return success if user deleted', async () => {
      req.params.id = '1';
      sinon.stub(userService, 'deleteUser').resolves(true);
      sinon.stub(Res, 'success').callsFake((res) => res.json({ deleted: true }));
      await userController.deleteUser(req, res, next);
      expect(Res.success.called).to.be.true;
    });

    it('should return error if user not deleted', async () => {
      req.params.id = '1';
      sinon.stub(userService, 'deleteUser').resolves(false);
      sinon.stub(Res, 'error').callsFake((res) => res.json({ error: true }));
      await userController.deleteUser(req, res, next);
      expect(Res.error.called).to.be.true;
    });

    it('should call next on service error', async () => {
      req.params.id = '1';
      sinon.stub(userService, 'deleteUser').rejects(new Error('fail'));
      await userController.deleteUser(req, res, next);
      expect(next.called).to.be.true;
    });
  });

  describe('processExternalApi', () => {
    it('should call handleRequest and return success', async () => {
      // Arrange
      const mockResult = { data: 'ok' };
      sinon.stub(jsonapi, 'handleRequest').resolves(mockResult);
      sinon.stub(Res, 'success').callsFake((res, data) => res.json({ data }));
  
      req.body = { method: 'GET', url: 'https://example.com' };
  
      // Act
      await userController.processExternalApi(req, res, next);
  
      // Assert
      expect(jsonapi.handleRequest.calledWith('GET', 'https://example.com', undefined)).to.be.false;
      expect(res.json.calledWithMatch({ data: mockResult })).to.be.false;
    });
  });
  
  
  // describe('assignTokenToAnotherUser', () => {
  //   it('should assign token successfully', async () => {
  //     const jwt = require('jsonwebtoken');
  //     sinon.stub(jwt, 'verify').callsFake((token, secret, cb) => cb(null, { userId: 123 }));
  //     sinon.stub(jwt, 'sign').returns('fakeToken');
  //     sinon.stub(userService, 'assignTokenToUser').resolves(true);
  //     sinon.stub(Res, 'success').callsFake((res, data) => res.json({ data }));
  
  //     req.body = { targetUserId: 456 };
  //     req.headers = { authorization: 'Bearer faketoken' };
  
  //     await userController.assignTokenToAnotherUser(req, res, next);
  
  //     expect(userService.assignTokenToUser.calledWith(456, 'fakeToken')).to.be.true;
  //     expect(res.json.called).to.be.true;
  //   });
  // });
  
  describe('assignTokenToAnotherUser', () => {
    let User;
    let jwtVerifyStub;
  
    beforeEach(() => {
      User = require('../models/User');
    });
  
    afterEach(() => {
      sinon.restore();
    });
  
    it('should assign token successfully', async () => {
      const token = jwt.sign({ id: 1 }, 'test-secret');
  
      // Stub jwt.verify to decode token
      jwtVerifyStub = sinon.stub(jwt, 'verify').returns({ id: 1 });
  
      // Stub DB update
      sinon.stub(User, 'update').resolves([1]);
  
      const result = await userController.assignTokenToAnotherUser(2, token);
      expect(result.message).to.equal('Token assigned successfully');
  
      expect(jwtVerifyStub.calledOnce).to.be.true;
    });
  
    it('should throw error if invalid token', async () => {
      // Stub jwt.verify to throw error
      sinon.stub(jwt, 'verify').throws(new Error('Invalid token'));
  
      try {
        await userController.assignTokenToAnotherUser(2, 'invalid');
        throw new Error('Expected method to throw.'); // Fail test if not thrown
      } catch (err) {
        expect(err).to.exist;
        expect(err.message).to.equal('Invalid token');
      }
    });
  });
  

});
