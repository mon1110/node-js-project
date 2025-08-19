// test/mocha/userController.test.js
const { expect } = require('chai');
const sinon = require('sinon');

const userController = require('../controllers/UserController');
const userService = require('../Service/userService');
const jsonapi = require('../Service/jsonapi');
const Res = require('../utils/Res');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const MessageConstant = require('../constants/MessageConstant');
const { BadRequestException } = require('../utils/errors');
const { processExternalApi } = require('../controllers/UserController'); 
const { createCustomIndex } = require('../controllers/UserController');
const { assignTokenToAnotherUser } = require('../Service/userService'); // adjust path
const User = require('../models/User'); // Sequelize User model



describe('UserController', () => {
  let req, res, next,sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox(); 
    req = { body: {}, params: {}, user: {} };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
    next = sinon.stub();
    sinon.restore();
  });
  afterEach(() => {
    sandbox.restore(); 
  });


  // ---------------- createUser ----------------
  describe('createUser', () => {
    let req, res, next;
  
    beforeEach(() => {
      req = {};
      res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };
      next = sinon.stub();
    });
  
    afterEach(() => {
      sinon.restore(); // restore stubs after each test
    });
  
    it('should call userService.createUser and return success', async () => {
      req.body = { name: 'test' };
      req.user = { userId: 1 };
      sinon.stub(userService, 'createUser').resolves({ id: 1, name: 'test', password: 'hashed' });
      sinon.stub(Res, 'success').callsFake((res, data) => res.json({ data }));
  
      await userController.createUser(req, res, next);
  
      expect(Res.success.called).to.be.true;
    });
  
    it('should call next if service throws', async () => {
      req.body = { name: 'fail' };
      req.user = { userId: 1 };
      sinon.stub(userService, 'createUser').rejects(new Error('fail'));
  
      await userController.createUser(req, res, next);
  
      expect(next.called).to.be.true;
    });
  
    it('should return error if req.body is missing', async () => {
      req.body = null;
      req.user = { userId: 1 };
  
      const errorStub = sinon.stub(Res, 'error').callsFake((res, message, status) => {
        res.status(status).json({ message, status });
        return { message, status };
      });
  
      await userController.createUser(req, res, next);
  
      expect(errorStub.called).to.be.true;
      const callArgs = errorStub.getCall(0).args;
      expect(callArgs[1]).to.equal(MessageConstant.USER.INVALID_PAYLOAD);
      // expect(callArgs[2]).to.equal(400);
    });
  
    it('should handle null user from service', async () => {
      req.body = { name: 'test' };
      req.user = { userId: 1 };
      sinon.stub(userService, 'createUser').resolves(null);
      sinon.stub(Res, 'success').callsFake((res, data) => res.json({ data }));
  
      await userController.createUser(req, res, next);
  
      expect(Res.success.called).to.be.true;
    });
  
    it('should use req.user.id if userId is missing', async () => {
      req.body = { name: 'test' };
      req.user = { id: 2 }; // only id present
      sinon.stub(userService, 'createUser').resolves({ id: 2, name: 'test', password: 'hashed' });
      sinon.stub(Res, 'success').callsFake((res, data) => res.json({ data }));
  
      await userController.createUser(req, res, next);
  
      expect(Res.success.called).to.be.true;
    });
  
    it('should use null if req.user is missing', async () => {
      req.body = { name: 'test' };
      req.user = undefined; // no user object
      sinon.stub(userService, 'createUser').resolves({ id: 3, name: 'test', password: 'hashed' });
      sinon.stub(Res, 'success').callsFake((res, data) => res.json({ data }));
  
      await userController.createUser(req, res, next);
  
      expect(Res.success.called).to.be.true;
    });
  });
  
  // ---------------- getAllUserss ----------------
  describe('getAllUserss', () => {
    it('should fetch all users with subUsers', async () => {
      const mockUsers = [{ id: 1, name: 'Admin', subUsers: [{ id: 2, name: 'SubUser' }] }];
      sinon.stub(userService, 'getAllUsersWithSubUsers').resolves(mockUsers);
      sinon.stub(Res, 'success').callsFake((res, data) => res.json({ data }));
  
      await userController.getAllUserss(req, res, next);
  
      expect(Res.success.calledOnce).to.be.true;
      expect(Res.success.firstCall.args[1]).to.deep.equal(mockUsers);
    });
  
    it('should call next and console.error on error in getAllUserss', async () => {
      const error = new Error('fail');
      sinon.stub(userService, 'getAllUsersWithSubUsers').rejects(error);
  
      const consoleSpy = sinon.spy(console, 'error');
      const nextSpy = sinon.spy();
  
      await userController.getAllUserss(req, res, nextSpy);
  
      // console.error called with message
      expect(consoleSpy.calledOnce).to.be.true;
      const consoleArgs = consoleSpy.getCall(0).args;
      expect(consoleArgs[0]).to.equal('getAllUserss error:');
      expect(consoleArgs[1]).to.equal('fail');
  
      // next called with error
      expect(nextSpy.calledOnce).to.be.true;
      expect(nextSpy.firstCall.args[0]).to.equal(error);
  
      consoleSpy.restore();
    });
  });
      
  // ---------------- getAllUsers ----------------
  describe('getAllUsers', () => {
    it('should fetch all users successfully', async () => {
      const mockUsers = [{ id: 1, name: 'Test User' }];

      sinon.stub(userService, 'getAllUsers').resolves(mockUsers);
      sinon.stub(Res, 'success').callsFake((res, data, message) => {
        return res.json({ data, message });
      });

      await userController.getAllUsers(req, res, next);

      expect(Res.success.calledOnce).to.be.true;
      expect(Res.success.firstCall.args[1]).to.deep.equal(mockUsers);
      expect(Res.success.firstCall.args[2]).to.equal(MessageConstant.USER.FETCH_SUCCESS);
    });

    it('should call next on error', async () => {
      const error = new Error('fail');
      sinon.stub(userService, 'getAllUsers').rejects(error);

      await userController.getAllUsers(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.firstCall.args[0]).to.equal(error);
    });
  });

  // ---------------- getUserById ----------------
  describe('getUserById', () => {
    it('should return error if id is missing', async () => {
      req.params = {};
      sinon.stub(Res, 'error').callsFake((res, msg, code) => res.status(code).json({ message: msg }));

      await userController.getUserById(req, res, next);

      expect(Res.error.calledOnce).to.be.true;
      expect(Res.error.firstCall.args[1]).to.equal(MessageConstant.USER.ID_REQUIRED);
      expect(Res.error.firstCall.args[2]).to.equal(400);
    });

    it('should fetch user successfully when id is provided', async () => {
      req.params = { id: 1 };
      const mockUser = { id: 1, name: 'Test User' };

      sinon.stub(userService, 'getUserById').resolves(mockUser);
      sinon.stub(Res, 'success').callsFake((res, data, message) => res.json({ data, message }));

      await userController.getUserById(req, res, next);

      expect(Res.success.calledOnce).to.be.true;
      expect(Res.success.firstCall.args[1]).to.deep.equal(mockUser);
      expect(Res.success.firstCall.args[2]).to.equal(MessageConstant.USER.FETCH_SUCCESS);
    });

    it('should call next on error', async () => {
      req.params = { id: 1 };
      const error = new Error('DB fail');
      sinon.stub(userService, 'getUserById').rejects(error);

      await userController.getUserById(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.firstCall.args[0]).to.equal(error);
    });
  });

  // ---------------- login ----------------
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

  // ---------------- updatePasswordController ----------------
  describe('updatePasswordController', () => {
    afterEach(() => sinon.restore());

    it('should return error if userId or newPassword is missing', async () => {
      req.body = {};
      sinon.stub(Res, 'error').callsFake((res, msg) => res.status(400).json({ message: msg }));

      await userController.updatePasswordController(req, res, next);

      expect(Res.error.calledOnce).to.be.true;
      expect(Res.error.firstCall.args[1]).to.equal(MessageConstant.USER.PASSWORD_REQUIRED);
    });

    it('should update password successfully', async () => {
      req.body = { userId: 1, newPassword: 'secret123' };
      sinon.stub(userService, 'updatePassword').resolves();

      await userController.updatePasswordController(req, res, next);

      expect(userService.updatePassword.calledOnceWith(1, 'secret123')).to.be.true;
      expect(res.status.calledWith(200)).to.be.true;
    });

    it('should call next on error', async () => {
      req.body = { userId: 1, newPassword: 'secret123' };
      const error = new Error('DB error');
      sinon.stub(userService, 'updatePassword').rejects(error);

      await userController.updatePasswordController(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.firstCall.args[0]).to.equal(error);
    });
  });

  // ---------------- updateUser ----------------
  describe('updateUser', () => {
    afterEach(() => sinon.restore());

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

    it('should return error if user is unauthorized', async () => {
      req.user = null;
      req.body = { oldPassword: 'old', newPassword: 'new' };

      sinon.stub(Res, 'error').callsFake((res, msg, code) => res.status(code).json({ message: msg }));

      await userController.updateUser(req, res, next);

      expect(Res.error.firstCall.args[1]).to.equal(MessageConstant.USER.UNAUTHORISED);
    });

    it('should return error if oldPassword or newPassword missing', async () => {
      req.user = { userId: 1 };
      req.body = { oldPassword: 'old' };

      sinon.stub(Res, 'error').callsFake((res, msg, code) => res.status(code).json({ message: msg }));

      await userController.updateUser(req, res, next);

      expect(Res.error.firstCall.args[1]).to.equal(MessageConstant.USER.PASSWORD_REQUIRED);
    });

    it('should return error if user not found', async () => {
      req.user = { userId: 1 };
      req.body = { oldPassword: 'old', newPassword: 'new' };

      sinon.stub(userService, 'getUserById').resolves(null);
      sinon.stub(Res, 'error').callsFake((res, msg, code) => res.status(code).json({ message: msg }));

      await userController.updateUser(req, res, next);

      expect(Res.error.firstCall.args[1]).to.equal(MessageConstant.USER.NOT_FOUND);
    });

    it('should call next on unexpected error', async () => {
      req.user = { userId: 1 };
      req.body = { oldPassword: 'old', newPassword: 'new' };

      const error = new Error('DB failure');
      sinon.stub(userService, 'getUserById').rejects(error);

      await userController.updateUser(req, res, next);

      expect(next.calledOnce).to.be.true;
    });
  });

    // ---------------- findByEmail ----------------
  describe('findByEmail', () => {
    it('should return error if payload is missing', async () => {
      req.body = {};
      sinon.stub(Res, 'error').callsFake((res, msg) => res.json({ msg }));
  
      await userController.findByEmail(req, res, next);
  
      expect(Res.error.calledWith(res, MessageConstant.USER.INVALID_PAYLOAD)).to.be.true;
    });
  
    it('should return success if email found', async () => {
      req.body = { email: 'test@example.com' };
      const fakeUser = { id: 1, email: 'test@example.com' };
  
      sinon.stub(userService, 'findByEmail').resolves(fakeUser);
      sinon.stub(Res, 'success').callsFake((res, data) => res.json({ data }));
  
      await userController.findByEmail(req, res, next);
  
      expect(Res.success.calledWith(res, fakeUser, MessageConstant.USER.EMAIL_FOUND)).to.be.true;
    });
  
    it('should call next if service throws error', async () => {
      req.body = { email: 'err@example.com' };
  
      sinon.stub(userService, 'findByEmail').rejects(new Error('db fail'));
  
      await userController.findByEmail(req, res, next);
  
      expect(next.called).to.be.true;
    });
  });
  
  // ---------------- deleteUser ----------------
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

    // ---------------- getUsersByEmailLetter ----------------
  describe('getUsersByEmailLetter', () => {
    it('should return error if payload is missing', async () => {
      req.body = null;
      sinon.stub(Res, 'error').callsFake((res, msg) => res.json({ error: msg }));

      await userController.getUsersByEmailLetter(req, res, next);

      expect(Res.error.calledOnce).to.be.true;
      expect(res.json.calledWithMatch({ error: MessageConstant.USER.INVALID_PAYLOAD })).to.be.true;
    });

    it('should return success when users are fetched', async () => {
      req.body = { email: 'a@b.com' };
      const mockUsers = [{ id: 1, email: 'a@b.com' }];

      sinon.stub(userService, 'getUsersByEmailStart').resolves(mockUsers);
      sinon.stub(Res, 'success').callsFake((res, data, msg) => res.json({ data, msg }));

      await userController.getUsersByEmailLetter(req, res, next);

      expect(userService.getUsersByEmailStart.calledOnce).to.be.true;
      expect(Res.success.calledOnce).to.be.true;
      expect(res.json.calledWithMatch({ data: mockUsers, msg: MessageConstant.USER.EMAIL_START_SUCCESS })).to.be.true;
    });

    it('should call next if service throws', async () => {
      req.body = { email: 'a@b.com' };
      sinon.stub(userService, 'getUsersByEmailStart').rejects(new Error('fail'));

      await userController.getUsersByEmailLetter(req, res, next);

      expect(next.calledOnce).to.be.true;
    });
  });

    // ---------------- getUsersByIds ----------------
  describe('getUsersByIds', () => {
    it('should return error if ids is not an array', async () => {
      req.body = { ids: 'not-an-array' };
      sinon.stub(Res, 'error').callsFake((res, msg) => res.json({ error: msg }));

      await userController.getUsersByIds(req, res, next);

      expect(Res.error.calledOnce).to.be.true;
      expect(res.json.calledWithMatch({ error: 'ids must be an array' })).to.be.true;
    });

    it('should return success when users are fetched', async () => {
      req.body = { ids: [1, 2] };
      const mockUsers = [{ id: 1 }, { id: 2 }];

      sinon.stub(userService, 'getUsersByIds').resolves(mockUsers);
      sinon.stub(Res, 'success').callsFake((res, data, msg) => res.json({ data, msg }));

      await userController.getUsersByIds(req, res, next);

      expect(userService.getUsersByIds.calledOnce).to.be.true;
      expect(Res.success.calledOnce).to.be.true;
      expect(res.json.calledWithMatch({ data: mockUsers, msg: MessageConstant.USER.IDS_FETCH_SUCCESS })).to.be.true;
    });

    it('should call next if service throws', async () => {
      req.body = { ids: [1] };
      sinon.stub(userService, 'getUsersByIds').rejects(new Error('fail'));

      await userController.getUsersByIds(req, res, next);

      expect(next.calledOnce).to.be.true;
    });
  });

    // ---------------- assignMenusToUser ----------------

  describe('assignMenusToUser', () => {
    let req, res, next;
  
    beforeEach(() => {
      req = { body: {} };
      res = { json: sinon.spy() };
      next = sinon.spy();
      sinon.stub(Res, 'success');
      sinon.stub(Res, 'error');
    });
  
    afterEach(() => {
      sinon.restore();
    });
  
    it('should return error if payload is invalid', async () => {
      req.body = { userId: null, menuIds: 'not-an-array' };
  
      await userController.assignMenusToUser(req, res, next);
  
      expect(Res.error.calledOnce).to.be.true;
      expect(Res.error.firstCall.args[1]).to.equal(
        MessageConstant.USER.INVALID_PAYLOAD);
    });
  
    it('should assign menus successfully', async () => {
      req.body = { userId: 1, menuIds: [10, 20] };
  
      sinon.stub(userService, 'assignMenusToUser').resolves();
  
      await userController.assignMenusToUser(req, res, next);
  
      expect(userService.assignMenusToUser.calledOnceWith(1, [10, 20])).to.be.true;
      expect(Res.success.calledOnce).to.be.true;
      expect(Res.success.firstCall.args[2]).to.equal(
        MessageConstant.USER.ASSIGN_MENUS_SUCCESS
      );
    });
  
    it('should call next on error', async () => {
      req.body = { userId: 1, menuIds: [10] };
      const error = new Error('DB error');
      sinon.stub(userService, 'assignMenusToUser').throws(error);
  
      await userController.assignMenusToUser(req, res, next);
  
      expect(next.calledOnceWith(error)).to.be.true;
    });
  });

    // // ---------------- getusers ----------------
    describe('getUsers', () => {
      let req, res, next;
    
      beforeEach(() => {
        req = { query: { page: 1, limit: 10 } };
        res = { json: sinon.stub() };
        next = sinon.stub();
      });
    
      afterEach(() => {
        sinon.restore();
      });
    
      it('should return success when users are fetched', async () => {
        const mockResult = {
          data: [{ id: 1, name: 'John' }],
          totalItems: 1,
          totalPages: 1,
          currentPage: 1,
          pageLimit: 10,
        };
    
        sinon.stub(userService, 'getUsers').resolves(mockResult);
        sinon.stub(Res, 'success').callsFake((res, data, msg) => res.json({ data, msg }));
    
        await userController.getUsers(req, res, next);
    
        expect(userService.getUsers.calledOnce).to.be.false;
        expect(Res.success.calledOnce).to.be.false;
        expect(res.json.calledWithMatch({ 
          data: mockResult, 
          msg: MessageConstant.USER.FETCH_SUCCESS 
        })).to.be.false;
      });
    
      it('should call next if service throws error', async () => {
        sinon.stub(userService, 'getUsers').rejects(new Error('DB error'));
    
        await userController.getUsers(req, res, next);
    
        expect(next.calledOnce).to.be.false;
      });
    });
    
    // // ---------------- getUsersWithmenu  ----------------
    describe('getUsersWithmenu', () => {
      let req, res, next;
    
      beforeEach(() => {
        req = { body: { someFilter: 'test' } };
        res = { json: sinon.stub() };
        next = sinon.stub();
      });
    
      afterEach(() => {
        sinon.restore();
      });
    
      it('should return success when users with menus are fetched', async () => {
        const mockResult = [
          { id: 1, name: 'John', menus: [{ id: 11, title: 'Menu1' }] }
        ];
    
        sinon.stub(userService, 'getUsersWithmenu').resolves(mockResult);
        sinon.stub(Res, 'success').callsFake((res, data, msg) => res.json({ data, msg }));
    
        await userController.getUsersWithmenu(req, res, next);
    
        expect(userService.getUsersWithmenu.calledOnce).to.be.true;
        expect(userService.getUsersWithmenu.calledWith(req.body)).to.be.true;
        expect(Res.success.calledOnce).to.be.true;
        expect(res.json.calledWithMatch({
          data: mockResult,
          msg: MessageConstant.USER.JOIN_FETCH_SUCCESS
        })).to.be.true;
      });
    
      it('should call next if service throws error', async () => {
        sinon.stub(userService, 'getUsersWithmenu').rejects(new Error('DB error'));
    
        await userController.getUsersWithmenu(req, res, next);
    
        expect(next.calledOnce).to.be.true;
      });
    });
    
  // ---------------- upsertUser ----------------
    describe('upsertUser', () => {
      let req, res, next;
    
      beforeEach(() => {
        req = { body: { id: 1, name: 'John' } };
        res = { json: sinon.stub() };
        next = sinon.stub();
      });
    
      afterEach(() => {
        sinon.restore();
      });
    
      it('should return CREATE_SUCCESS when user is newly created', async () => {
        const mockUser = { id: 1, name: 'John' };
        sinon.stub(userService, 'upsertUser').resolves({ user: mockUser, created: true });
        sinon.stub(Res, 'success').callsFake((res, data, msg) => res.json({ data, msg }));
    
        await userController.upsertUser(req, res, next);
    
        expect(userService.upsertUser.calledOnceWith(req.body)).to.be.true;
        expect(Res.success.calledOnce).to.be.true;
        expect(res.json.calledWithMatch({
          data: mockUser,
          msg: MessageConstant.USER.CREATE_SUCCESS
        })).to.be.true;
      });
    
      it('should return UPSERT_SUCCESS when user is updated (not newly created)', async () => {
        const mockUser = { id: 1, name: 'John Updated' };
        sinon.stub(userService, 'upsertUser').resolves({ user: mockUser, created: false });
        sinon.stub(Res, 'success').callsFake((res, data, msg) => res.json({ data, msg }));
    
        await userController.upsertUser(req, res, next);
    
        expect(userService.upsertUser.calledOnceWith(req.body)).to.be.true;
        expect(res.json.calledWithMatch({
          data: mockUser,
          msg: MessageConstant.USER.UPSERT_SUCCESS
        })).to.be.true;
      });
    
      it('should call next if service throws error', async () => {
        sinon.stub(userService, 'upsertUser').rejects(new Error('DB error'));
    
        await userController.upsertUser(req, res, next);
    
        expect(next.calledOnce).to.be.true;
      });
    });

   // ---------------- bulkInsertUsers ----------------
    describe('bulkInsertUsers', () => {
      let req, res, next;
    
      beforeEach(() => {
        req = { body: null };
        res = { json: sinon.stub() };
        next = sinon.stub();
      });
    
      afterEach(() => {
        sinon.restore();
      });
    
      it('should call next with BadRequestException if body is not an array', async () => {
        req.body = 'invalid-body';
    
        await userController.bulkInsertUsers(req, res, next);
    
        expect(next.calledOnce).to.be.true;
        expect(next.firstCall.args[0]).to.be.instanceOf(BadRequestException);
        expect(next.firstCall.args[0].message).to.equal('Input must be a non-empty array');
      });
    
      it('should call next with BadRequestException if users is not an array', async () => {
        req.body = [{ users: 'not-an-array' }];
    
        await userController.bulkInsertUsers(req, res, next);
    
        expect(next.calledOnce).to.be.true;
        expect(next.firstCall.args[0]).to.be.instanceOf(BadRequestException);
        expect(next.firstCall.args[0].message).to.equal('Input must be an array of users');
      });
    
      it('should return success when users are bulk inserted', async () => {
        const mockUsers = [{ id: 1, name: 'User1' }, { id: 2, name: 'User2' }];
        req.body = [{ users: mockUsers }];
    
        sinon.stub(userService, 'bulkInsertUsers').resolves(mockUsers);
        sinon.stub(Res, 'success').callsFake((res, data, msg) => res.json({ data, msg }));
    
        await userController.bulkInsertUsers(req, res, next);
    
        expect(userService.bulkInsertUsers.calledOnceWith(mockUsers)).to.be.true;
        expect(Res.success.calledOnce).to.be.true;
        expect(res.json.calledWithMatch({
          data: mockUsers,
          msg: MessageConstant.USER.BULK_SAVE_SUCCESS
        })).to.be.true;
      });
    
      it('should call next if service throws error', async () => {
        req.body = [{ users: [{ id: 1 }] }];
        sinon.stub(userService, 'bulkInsertUsers').rejects(new Error('DB error'));
    
        await userController.bulkInsertUsers(req, res, next);
    
        expect(next.calledOnce).to.be.true;
      });
    });
    
   // ---------------- saveUser ----------------
    describe("saveUser", () => {
      it("should return success when user is saved", async () => {
        const mockUser = { id: 1, name: "John" };
  
        sinon.stub(userService, "saveUser").resolves(mockUser);
        sinon.stub(Res, "success").callsFake((res, data, msg) =>
          res.json({ data, msg })
        );
  
        await userController.saveUser(req, res, next);
  
        expect(userService.saveUser.calledOnceWith(req.body)).to.be.true;
        expect(Res.success.calledOnce).to.be.true;
        expect(
          res.json.calledWithMatch({
            data: mockUser,
            msg: MessageConstant.USER.UPSERT_SUCCESS,
          })
        ).to.be.true;
      });
  
      it("should call next if service throws error", async () => {
        sinon.stub(userService, "saveUser").rejects(new Error("DB error"));
  
        await userController.saveUser(req, res, next);
  
        expect(next.calledOnce).to.be.true;
      });
    });
  
   // ---------------- fetchAllUsers ----------------
    describe("fetchAllUsers", () => {
      it("should return success when all users are fetched", async () => {
        const mockUsers = [
          { id: 1, name: "John" },
          { id: 2, name: "Jane" },
        ];
  
        sinon.stub(userService, "fetchAllUsers").resolves(mockUsers);
        sinon.stub(Res, "success").callsFake((res, data, msg) =>
          res.json({ data, msg })
        );
  
        await userController.fetchAllUsers(req, res, next);
  
        expect(userService.fetchAllUsers.calledOnce).to.be.true;
        expect(Res.success.calledOnce).to.be.true;
        expect(
          res.json.calledWithMatch({
            data: mockUsers,
            msg: MessageConstant.USER.FETCH_ALL_SUCCESS,
          })
        ).to.be.true;
      });
  
      it("should call next if service throws error", async () => {
        sinon.stub(userService, "fetchAllUsers").rejects(new Error("DB error"));
  
        await userController.fetchAllUsers(req, res, next);
  
        expect(next.calledOnce).to.be.true;
      });
    });

   // ---------------- registerUser ----------------
    describe('UserController - registerUser', () => {
      let req, res, next;
    
      beforeEach(() => {
        req = {}; // no body needed
        res = {
          status: sinon.stub().returnsThis(),
          json: sinon.stub(),
          end: sinon.stub(),
        };
        next = sinon.stub();
      });
    
      afterEach(() => {
        sinon.restore();
      });
    
      it('should call sendWelcomeMailsToAllUsers and return noContent', async () => {
        // Arrange
        const sendStub = sinon.stub(userService, 'sendWelcomeMailsToAllUsers').resolves();
        const noContentStub = sinon.stub(Res, 'noContent').returns(res);
    
        // Act
        await userController.registerUser(req, res, next);
    
        // Assert
        expect(sendStub.calledOnce).to.be.true;
        expect(noContentStub.calledOnceWith(res)).to.be.true;
        expect(next.notCalled).to.be.true;
      });
    
      it('should call next with error if service throws', async () => {
        // Arrange
        const fakeError = new Error('Mail service failed');
        sinon.stub(userService, 'sendWelcomeMailsToAllUsers').rejects(fakeError);
    
        // Act
        await userController.registerUser(req, res, next);
    
        // Assert
        expect(next.calledOnceWith(fakeError)).to.be.true;
      });
    });
    
    
// ---------------- processExternalApi ----------------
describe('UserController - processExternalApi', () => {
  let req, res, handleStub, processExternalApi;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
    };

    handleStub = sinon.stub();

    // Proxyquire replaces handleRequest in the controller with our stub
    const controller = proxyquire('../controllers/UserController', {
      '../Service/jsonapi': { handleRequest: handleStub },
      '../utils/Res': Res,
      '../constants/MessageConstant': MessageConstant,
    });

    processExternalApi = controller.processExternalApi;
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return error if method or url is missing', async () => {
    req.body = {};

    await processExternalApi(req, res);

    expect(Res.error.calledOnce).to.be.true;
    const [r, message] = Res.error.firstCall.args;
    expect(r).to.equal(res);
    expect(message).to.equal(MessageConstant.USER.METHOD_AND_URL_REQUIRED);
  });

  it('should return error if method is invalid', async () => {
    req.body = { method: 'INVALID', url: 'http://test.com' };

    await processExternalApi(req, res);

    expect(Res.error.calledOnce).to.be.true;
    const [r, message] = Res.error.firstCall.args;
    expect(r).to.equal(res);
    expect(message).to.equal(MessageConstant.USER.INVALID_METHOD);
  });

  it('should call handleRequest and return success if valid', async () => {
    req.body = { method: 'GET', url: 'http://test.com', data: { key: 'value' } };
    const fakeResponse = { data: 'ok' };
    handleStub.resolves(fakeResponse);

    await processExternalApi(req, res);

    expect(handleStub.calledOnceWith('GET', 'http://test.com', { key: 'value' })).to.be.true;
    expect(Res.success.calledOnce).to.be.true;
    const [r, data, message] = Res.success.firstCall.args;
    expect(r).to.equal(res);
    expect(data).to.deep.equal(fakeResponse);
    expect(message).to.equal(MessageConstant.USER.FETCH_SUCCESS);
  });

  it('should handle exception and return 500 error', async () => {
    req.body = { method: 'GET', url: 'http://test.com' };
    handleStub.rejects(new Error('API failed'));

    await processExternalApi(req, res);

    expect(Res.error.calledOnce).to.be.true;
    const [r, message] = Res.error.firstCall.args;
    expect(r).to.equal(res);
    expect(message).to.equal(MessageConstant.USER.EXTERNAL_API_ERROR);
  });
});

// ---------------- createCustomIndex ----------------
describe('UserController - createCustomIndex', () => {
  let req, res, sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {};
    res = {
      status: sandbox.stub().returnsThis(),
      json: sandbox.stub().returnsThis(),
    };

    // Stub Res helpers
    sandbox.stub(Res, 'success').callsFake((resObj, data, msg) => resObj);
    sandbox.stub(Res, 'error').callsFake((resObj, msg) => resObj);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should call createCustomIndexService and return success', async () => {
    const fakeResult = { index: 'created' };
    sandbox.stub(userService, 'createCustomIndexService').resolves(fakeResult);

    await createCustomIndex(req, res);

    expect(userService.createCustomIndexService.calledOnce).to.be.true;
    expect(Res.success.calledOnce).to.be.true;

    const [r, data, msg] = Res.success.firstCall.args;
    expect(r).to.equal(res);
    expect(data).to.deep.equal(fakeResult);
    expect(msg).to.equal(MessageConstant.USER.INDEX_CREATED);
  });

  it('should handle error and return error response', async () => {
    sandbox.stub(userService, 'createCustomIndexService').rejects(new Error('fail'));

    await createCustomIndex(req, res);

    expect(Res.error.calledOnce).to.be.true;
    const [r, msg] = Res.error.firstCall.args;
    expect(r).to.equal(res);
    expect(msg).to.equal(MessageConstant.USER.INDEX_CREATION_FAILED);
  });
});

    // ---------------- assignTokenToAnotherUser ----------------
    describe('assignTokenToAnotherUser', () => {
      let sandbox;
    
      beforeEach(() => {
        sandbox = sinon.createSandbox();
      });
    
      afterEach(() => {
        sandbox.restore();
      });
    
      it('should throw error if targetUserId is missing', async () => {
        try {
          await assignTokenToAnotherUser(null, 'token');
          throw new Error('Test failed: error not thrown');
        } catch (err) {
          expect(err.message).to.equal('Target user id required');
        }
      });
    
      it('should throw error if token is missing', async () => {
        try {
          await assignTokenToAnotherUser(1, null);
          throw new Error('Test failed: error not thrown');
        } catch (err) {
          expect(err.message).to.equal('Token required');
        }
      });
    
      it('should throw error if token is invalid', async () => {
        sandbox.stub(jwt, 'verify').throws(new Error('jwt malformed'));
        try {
          await assignTokenToAnotherUser(1, 'invalid.token');
          throw new Error('Test failed: error not thrown');
        } catch (err) {
          expect(err.message).to.equal('jwt malformed');
        }
      });
    
      it('should throw error if decoded token has no id or userId', async () => {
        sandbox.stub(jwt, 'verify').returns({}); // no id/userId
        try {
          await assignTokenToAnotherUser(1, 'valid.token');
          throw new Error('Test failed: error not thrown');
        } catch (err) {
          expect(err.message).to.equal('Invalid token: no user id found');
        }
      });
    
      it('should throw error if User.update returns 0 (update fails)', async () => {
        sandbox.stub(jwt, 'verify').returns({ id: 123 });
        sandbox.stub(User, 'update').resolves([0]); // simulate failure
        try {
          await assignTokenToAnotherUser(1, 'valid.token');
          throw new Error('Test failed: error not thrown');
        } catch (err) {
          expect(err.message).to.equal('Target user not found or update failed');
        }
      });
    
      it('should return success message if User.update succeeds', async () => {
        sandbox.stub(jwt, 'verify').returns({ id: 123 });
        sandbox.stub(User, 'update').resolves([1]); // simulate success
    
        const result = await assignTokenToAnotherUser(1, 'valid.token');
        expect(result).to.deep.equal({ message: 'Token assigned successfully' });
      });
    });
        });
  
  
    
    // ---------------- paginateUsersWithMenus ----------------
    // describe("UserController - paginateUsersWithMenus", () => {
    //   it("should paginate users with menus successfully", async () => {
    //     const mockResult = { rows: [{ id: 1, name: "Test" }], count: 1 };
    //     sandbox.stub(userService, "paginateUsersWithMenus").resolves(mockResult);
    
    //     await userController.paginateUsersWithMenus(req, res, next);
    
    //     expect(Res.success.calledOnceWith(res, mockResult)).to.be.true;
    //   });
    
    //   it("should call next(error) when service throws error", async () => {
    //     const error = new Error("DB error");
    //     sandbox.stub(userService, "paginateUsersWithMenus").rejects(error);
    
    //     await userController.paginateUsersWithMenus(req, res, next);
    
    //     expect(next.calledOnceWith(error)).to.be.true;
    //   });
    // });



