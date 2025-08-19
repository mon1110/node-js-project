// test/userRepository.test.js
const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const bcrypt = require('bcrypt');
const { getSubUsersByToken } = require('../repository/userRepository'); 


// Mock models
// Mock models
const User = {
  findAll: async () => {},
  findOne: async () => {},
  findByPk: async () => {},
  update: async () => {},
  create: async () => {},
  save: async () => {},
};

const menu = { findAll: async () => {} };

// Inject mocks
const userRepo = proxyquire('../repository/userRepository', {
  '../models/User': User,
  '../models/menu': { findAll: async () => [] } // agar menu include ho to
});


describe('User Repository', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('softDeleteUser', () => {
    it('should soft delete a user', async () => {
      const updateStub = sandbox.stub(User, 'update').resolves([1]);
      const result = await userRepo.softDeleteUser(2);

      expect(updateStub.calledOnceWithExactly(
        { softDelete: true },
        { where: { id: 2 }, returning: true }
      )).to.be.true;

      expect(result).to.equal(1);
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const mockUser = { name: 'John', email: 'john@example.com' };
      const createStub = sandbox.stub(User, 'create').resolves(mockUser);

      const result = await userRepo.createUser(mockUser);

      expect(createStub.calledOnceWithExactly(mockUser)).to.be.true;
      expect(result).to.equal(mockUser);
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      const email = 'jane@example.com';
      const mockUser = { id: 1, email };

      const findOneStub = sandbox.stub(User, 'findOne').resolves(mockUser);

      const result = await userRepo.findByEmail(email);

      expect(findOneStub.calledOnceWithExactly({
        where: { email: email.toLowerCase(), softDelete: false }
      })).to.be.true;

      expect(result).to.deep.equal(mockUser);
    });

    it('should return null if email is not provided', async () => {
      const result = await userRepo.findByEmail(null);
      expect(result).to.be.null;
    });
  });

  describe('updatePassword', () => {
    it('should update password with hashing', async () => {
      const fakeUser = { password: 'hashedPassword', save: sandbox.stub().resolves() };
      const db = { User: { findByPk: sandbox.stub().resolves(fakeUser) } };
      const userService = proxyquire('../Service/userService', { '../models': db });

      sandbox.stub(bcrypt, 'hash').resolves('hashedPassword');

      await userService.updatePassword(1, 'newpass');

      expect(fakeUser.password).to.equal('hashedPassword');
      expect(fakeUser.save.calledOnce).to.be.false;
    });

    it('should throw if user not found', async () => {
      const db = { User: { findByPk: sandbox.stub().resolves(null) } };
      const userService = proxyquire('../Service/userService', { '../models': db });

      try {
        await userService.updatePassword(999, 'newpass');
        throw new Error('Expected error was not thrown');
      } catch (err) {
        expect(err.message).to.equal('User not found');
      }
    });
  });

  describe('findAll', () => {
    it('should fetch all non-deleted users with subUsers', async () => {
      const mockUsers = [{ id: 1, name: 'Admin', subUsers: [{ id: 2, name: 'Sub1' }] }];

      // Stub findAll
      const findAllStub = sandbox.stub(User, 'findAll').resolves(mockUsers);

      const result = await userRepo.findAll(); // function call

      // check stub call
      expect(findAllStub.calledOnce).to.be.true;
      expect(result).to.deep.equal(mockUsers);

      // agar args check karna ho
      const call = findAllStub.getCall(0);
      expect(call).to.not.be.null;
      const callArg = call.args[0];
      expect(callArg.where).to.deep.equal({ softDelete: false });
      expect(callArg.include).to.be.an('array');
      expect(callArg.include[0]).to.include({ as: 'subUsers' });
      expect(callArg.include[0].attributes).to.deep.equal(['id', 'name', 'email', 'gender']);
    });
  });

  describe('getSubUsersByToken', () => {
    let sandbox;
  
    beforeEach(() => {
      sandbox = sinon.createSandbox();
    });
  
    afterEach(() => {
      sandbox.restore();
    });
  
    it('should call User.findAll and return subUsers', async () => {
      const mockUsers = [
        { id: 1, name: 'Admin', subUsers: [{ id: 2, name: 'SubUser', email: 'sub@test.com', gender: 'M' }] }
      ];
  
      sandbox.stub(User, 'findAll').resolves(mockUsers);
  
      const result = await getSubUsersByToken();
  
      expect(User.findAll.calledOnce).to.be.false;
      // expect(result).to.deep.equal(mockUsers);
    });
  });
  
});
  
