// tests/userService.test.js

//  Mock config and models before importing userService

jest.mock('../config/db.config', () => ({
  define: jest.fn(() => ({
    sync: jest.fn(),
  })),
}));

jest.mock('../utils/settingsUtil', () => ({
  getAuthConfig: jest.fn().mockResolvedValue({
    maxAttempts: 4,
    blockDurationMs: 30000,
  }),
}));

jest.mock('../models/User', () => {
  function UserMock() {}
  
  // Simulate instance method like .toJSON()
  UserMock.prototype.toJSON = function () {
    return {
      id: 1,
      name: 'Mock User',
      email: 'mock@example.com',
    };
  };

  // Simulate static methods
  UserMock.findOne = jest.fn();
  UserMock.create = jest.fn();
  UserMock.findByPk = jest.fn();

  return UserMock;
});

jest.mock('../models/index', () => ({
  User: {
    create: jest.fn(),
    findOne: jest.fn(),
    hasMany: jest.fn(),
    belongsTo: jest.fn(),
  },
  Product: {
    create: jest.fn(),
    hasMany: jest.fn(),
    belongsTo: jest.fn(),
  },
  menu: {
    findAll: jest.fn(),
  },
  Settings: {
    getConfig: jest.fn(),
  }
}));

// ✅ Import modules AFTER mocks
const userService = require('../Service/userService');
const userRepo = require('../repository/userRepository');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { USER } = require('../constants/MessageConstant'); // ✅ Fixed here

jest.mock('../repository/userRepository');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('userService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a user and return user with token', async () => {
      const userData = {
        name: 'abcde',
        email: 'abcde@gmail.com',
        password: 'ax',
        menuIds: [1, 2],
        gender: 'FEMALE'
      };

      userRepo.findByEmail.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashed-password');
      userRepo.createUser.mockResolvedValue({
        id: 1,
        ...userData,
        password: 'hashed-password'
      });
      jwt.sign.mockReturnValue('fake-jwt-token');

      const result = await userService.createUser(userData, 123);
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token', 'fake-jwt-token');
      expect(userRepo.createUser).toHaveBeenCalled();
    });

    it('should throw error if email already exists', async () => {
      const userData = {
        name: 'Existing User',
        email: 'existing@example.com',
        password: 'Password123',
        menuIds: [],
        gender: 'MALE'
      };

      userRepo.findByEmail.mockResolvedValue({
        id: 10,
        name: 'Existing User',
        email: 'existing@example.com'
      });

      await expect(userService.createUser(userData, 123))
        .rejects
        .toThrow('Email already exists');
    });
  });

  describe('login', () => {
    it('should login user and return user with token', async () => {
      const loginData = {
        email: 'abcde@gmail.com',
        password: 'ax'
      };

      const storedUser = {
        id: 1,
        name: 'abcde',
        email: 'abcde@gmail.com',
        password: 'hashed-password',
        gender: 'FEMALE',
        menuIds: [1, 2],
        failedAttempts: 0,
        blockedAt: null
      };

      userRepo.findByEmail.mockResolvedValue(storedUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('fake-jwt-token');

      const result = await userService.login(loginData);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token', 'fake-jwt-token');
      expect(userRepo.findByEmail).toHaveBeenCalledWith(loginData.email);
    });

    it('should throw error if email does not exist', async () => {
      const loginData = {
        email: 'nonexistent@gmail.com',
        password: 'anyPassword'
      };

      userRepo.findByEmail.mockResolvedValue(null);

      await expect(userService.login(loginData)).rejects.toThrow(
        USER.INVALID_EMAIL_OR_PASSWORD
      );
    });

    it('should throw error if password is incorrect', async () => {
      const loginData = {
        email: 'abcde@gmail.com',
        password: 'wrongPassword'
      };

      const storedUser = {
        id: 1,
        name: 'abcde',
        email: 'abcde@gmail.com',
        password: 'hashed-password',
        gender: 'FEMALE',
        menuIds: [1, 2],
        failedAttempts: 0,
        blockedAt: null
      };

      userRepo.findByEmail.mockResolvedValue(storedUser);
      bcrypt.compare.mockResolvedValue(false);

      await expect(userService.login(loginData)).rejects.toThrow(
        USER.invalidCredentialWithCount(1, 4)
      );
    });
  });
});
