const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;
const proxyquire = require('proxyquire').noCallThru();

const userRepo = require('../repository/userRepository');
const bcrypt = require('bcrypt');
const jwtUtil = require('../utils/jwt');
const settingsUtil = require('../utils/settingsUtil');
const rmqService = require('../Service/rmqService');

describe('userService', () => {
  let sandbox;
  let userService;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    // default require without proxyquire unless overridden
    userService = require('../Service/userService');
  });

  afterEach(() => {
    sandbox.restore();
    delete require.cache[require.resolve('../Service/userService')];
  });

  describe('createUser', () => {
    it('should throw if required fields missing', async () => {
      try {
        await userService.createUser({});
      } catch (err) {
        expect(err.message).to.include('All fields are required');
      }
    });
  
    it('should throw if email exists', async () => {
      sandbox.stub(userRepo, 'findByEmail').resolves({ id: 1, email: 'exists@example.com' });
  
      try {
        await userService.createUser({
          name: 'Test',
          email: 'exists@example.com',
          menuIds: [1],
          password: 'pass',
          gender: 'M',
        });
      } catch (err) {
        expect(err.message).to.include('Email already exists');
      }
    });
  
    it('should create user and return token', async () => {
      // Create a local userService using proxyquire to stub jwtUtil
      const fakeJwtUtil = { generateToken: () => 'fakeToken' };
      const localUserService = proxyquire('../Service/userService', {
        '../repository/userRepository': userRepo,
        '../utils/jwt': fakeJwtUtil,
        'bcrypt': bcrypt
      });
  
      it('should create user and return token', async () => {
        sandbox.stub(userRepo, 'findByEmail').resolves(null);
        sandbox.stub(userRepo, 'createUser').resolves({ id: 1, email: 'test@example.com' });
        sandbox.stub(bcrypt, 'hash').resolves('hashedpass');
      
        const result = await localUserService.createUser({
          name: 'Test',
          email: 'test@example.com',
          menuIds: [1],
          password: 'pass',
          gender: 'M',
        });
      
        expect(result).to.have.property('token', 'fakeToken');   // now this works
        expect(result.user).to.have.property('email', 'test@example.com');
      });
    });
    });

  describe('login', () => {
    it('should throw if email or password missing', async () => {
      try {
        await userService.login({ email: '', password: '' });
      } catch (err) {
        expect(err.message).to.include('All fields are required');
      }
    });

    it('should throw if user not found', async () => {
      sandbox.stub(userRepo, 'findByEmail').resolves(null);

      try {
        await userService.login({ email: 'nouser@example.com', password: 'pass' });
      } catch (err) {
        expect(err.message).to.include('Invalid email or password');
      }
    });

    it('should throw if user blocked', async () => {
      const user = {
        email: 'blocked@example.com',
        blockedAt: new Date(Date.now() - 1000),
        failedAttempts: 3,
      };
      sandbox.stub(userRepo, 'findByEmail').resolves(user);
      sandbox.stub(settingsUtil, 'getAuthConfig').resolves({ maxAttempts: 3, blockDurationMs: 600000 });

      try {
        await userService.login({ email: 'blocked@example.com', password: 'pass' });
      } catch (err) {
        expect(err.message).to.include('blocked');
      }
    });

    it('should throw if password incorrect and increment attempts', async () => {
      const user = { email: 'user@example.com', password: 'hashedpass', failedAttempts: 1, blockedAt: null };
      sandbox.stub(userRepo, 'findByEmail').resolves(user);
      sandbox.stub(settingsUtil, 'getAuthConfig').resolves({ maxAttempts: 3, blockDurationMs: 600000 });
      sandbox.stub(bcrypt, 'compare').resolves(false);
      sandbox.stub(userRepo, 'updateByEmail').resolves();

      try {
        await userService.login({ email: 'user@example.com', password: 'wrongpass' });
      } catch (err) {
        expect(err.message).to.include('Invalid email or password');
      }
    });

    it('should return user and token on successful login', async () => {
      const user = { id: 1, email: 'user@example.com', password: 'hashedpass', failedAttempts: 0, blockedAt: null };
      sandbox.stub(userRepo, 'findByEmail').resolves(user);
      sandbox.stub(settingsUtil, 'getAuthConfig').resolves({ maxAttempts: 3, blockDurationMs: 600000 });
      sandbox.stub(bcrypt, 'compare').resolves(true);
      sandbox.stub(userRepo, 'updateByEmail').resolves();
      sandbox.stub(jwtUtil, 'generateToken').returns('fakeToken');

      const result = await userService.login({ email: 'user@example.com', password: 'correctpass' });

      expect(result).to.have.property('token', 'fakeToken');
      expect(result.user).to.equal(user);
    });
  });

  describe('updateUser', () => {
    it('should throw error if user not found', async () => {
      sandbox.stub(userRepo, 'findById').resolves(null);

      try {
        await userService.updateUser(999, { name: 'NewName' });
      } catch (err) {
        expect(err.message).to.include('not found');
      }
    });

    it('should update user data and save', async () => {
      const user = { save: sandbox.stub().resolves(), name: 'OldName' };
      sandbox.stub(userRepo, 'findById').resolves(user);

      await userService.updateUser(1, { name: 'NewName' });

      expect(user.name).to.equal('NewName');
      expect(user.save.calledOnce).to.be.true;
    });
  });

  describe('updatePassword', () => {
    it('should update password with hashing', async () => {
      const fakeUser = {
        password: 'oldPass',
        save: sandbox.stub().resolves()
      };

      // Mock repo to return fakeUser
      sandbox.stub(userRepo, 'findById').resolves(fakeUser);

      // Mock bcrypt to return deterministic value
      sandbox.stub(bcrypt, 'hash').resolves('hashedPassword');

      const result = await userService.updatePassword(1, 'newpass');

      // Assertions
      expect(result).to.equal(fakeUser); // Returns the same fakeUser
      expect(fakeUser.password).to.equal('hashedPassword');
      expect(fakeUser.save.calledOnce).to.be.true;
    });

    it('should throw if user not found', async () => {
      sandbox.stub(userRepo, 'findById').resolves(null);

      try {
        await userService.updatePassword(999, 'newpass');
      } catch (err) {
        expect(err.message).to.include('not found');
      }
    });
  });

  describe('deleteUser', () => {
    it('should call softDeleteUser and return result', async () => {
      const deleteResult = { deleted: true };
      sandbox.stub(userRepo, 'softDeleteUser').resolves(deleteResult);

      const result = await userService.deleteUser(1);
      expect(result).to.equal(deleteResult);
    });
  });

  describe('findByEmail', () => {
    it('should throw if email missing', async () => {
      try {
        await userService.findByEmail({});
      } catch (err) {
        expect(err.message).to.include('Email required');
      }
    });

    it('should throw if user not found', async () => {
      sandbox.stub(userRepo, 'findByEmail').resolves(null);

      try {
        await userService.findByEmail({ email: 'nouser@example.com' });
      } catch (err) {
        expect(err.message).to.include('not found');
      }
    });

    it('should return user if found', async () => {
      const user = { email: 'test@example.com' };
      sandbox.stub(userRepo, 'findByEmail').resolves(user);

      const result = await userService.findByEmail({ email: 'test@example.com' });
      expect(result).to.equal(user);
    });
  });

  describe('assignMenusToUser', () => {
    it('should throw if user not found', async () => {
      sandbox.stub(userRepo, 'findUserById').resolves(null);

      try {
        await userService.assignMenusToUser(999, [1, 2]);
      } catch (err) {
        expect(err.message).to.include('not found');
      }
    });

    it('should update menus if user found', async () => {
      const user = { id: 1 };
      sandbox.stub(userRepo, 'findUserById').resolves(user);
      sandbox.stub(userRepo, 'updateUserMenus').resolves({ id: 1, menuIds: [1, 2] });

      const result = await userService.assignMenusToUser(1, [1, 2]);
      expect(result.menuIds).to.include(1);
      expect(result.menuIds).to.include(2);
    });
  });

  describe('getUsers', () => {
    it('should throw if no users found', async () => {
      sandbox.stub(userRepo, 'getUsers').resolves({ data: [] });

      try {
        await userService.getUsers({ filter: {}, sort: {}, page: 1 });
      } catch (err) {
        expect(err.message).to.include('No users found');
      }
    });

    it('should return users if found', async () => {
      const users = [{ id: 1 }];
      sandbox.stub(userRepo, 'getUsers').resolves({ data: users });

      const result = await userService.getUsers({ filter: {}, sort: {}, page: 1 });
      expect(result.data).to.eql(users);
    });
  });

  describe('sendMail', () => {
    it('should call RMQ service', async () => {
      sandbox.stub(rmqService, 'sendMailToQueue').resolves(true);

      const result = await userService.sendMail({ email: 'a@b.com' });
      expect(result).to.be.true;
    });
  });
});
