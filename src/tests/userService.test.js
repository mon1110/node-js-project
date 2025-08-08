// tests/userService.test.js
jest.mock('../config/db.config', () => {
  return {
    define: jest.fn(() => {
      return {};  // mock model definition returning empty object
    }),
    authenticate: jest.fn().mockResolvedValue(true),
    sync: jest.fn().mockResolvedValue(true),
  };
});

// Mocking User model and its methods
jest.mock('../models', () => ({
  User: {
    findByPk: jest.fn(),
  }
}));

// Mock userRepository methods
jest.mock('../repository/userRepository', () => ({
  findByEmail: jest.fn(),
  createUser: jest.fn(),
  updateByEmail: jest.fn(),
  softDeleteUser: jest.fn(),
  getUserById: jest.fn(),
  findAll: jest.fn(),
  getAllUsers: jest.fn(),
}));

// rest of your imports here
const userService = require('../Service/userService');
const bcrypt = require('bcrypt');
const { User } = require('../models');
const userRepo = require('../repository/userRepository');
const { sendToMailQueue } = require('../Service/rmqService');

jest.mock('../Service/rmqService', () => ({
  sendToMailQueue: jest.fn(),
}));

jest.mock('../Service/rmqService', () => ({
  sendToMailQueue: jest.fn(),
}));

describe('userService', () => {
  const mockUser = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    password: '',
    save: jest.fn().mockResolvedValue(true),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('updatePassword', () => {
    it('should update user password successfully', async () => {
      User.findByPk.mockResolvedValue(mockUser);

      await userService.updatePassword(1, 'newSecurePassword');

      expect(mockUser.save).toHaveBeenCalled();

      // Verify that password is hashed correctly
      const isMatch = await bcrypt.compare('newSecurePassword', mockUser.password);
      expect(isMatch).toBe(true);
    });

    it('should throw error if user not found', async () => {
      User.findByPk.mockResolvedValue(null);

      await expect(userService.updatePassword(1, 'newSecurePassword')).rejects.toThrow('User not found');
    });
  });

  describe('sendWelcomeMailsToAllUsers', () => {
    it('should send mail to valid users only', async () => {
      const users = [
        { name: 'Alice', email: 'alice@example.com' },
        { name: '', email: 'noName@example.com' },
        { name: 'Bob', email: '' },
        { name: 'Charlie', email: 'charlie@example.com' },
      ];
      userRepo.getAllUsers.mockResolvedValue(users);

      await userService.sendWelcomeMailsToAllUsers();

      const { sendToMailQueue } = require('../Service/rmqService');
      expect(sendToMailQueue).toHaveBeenCalledTimes(2);

      expect(sendToMailQueue).toHaveBeenCalledWith(expect.objectContaining({
        to: 'alice@example.com',
        name: 'Alice',
        subject: 'Welcome!',
      }));
      expect(sendToMailQueue).toHaveBeenCalledWith(expect.objectContaining({
        to: 'charlie@example.com',
        name: 'Charlie',
        subject: 'Welcome!',
      }));
    });
  });

  describe('getUserById', () => {
    it('should throw error if id is not a number', async () => {
      await expect(userService.getUserById('abc')).rejects.toThrow();
    });

    it('should throw error if user not found', async () => {
      userRepo.getUserById.mockResolvedValue(null);

      await expect(userService.getUserById(1)).rejects.toThrow();
    });

    it('should return user if found', async () => {
      const user = { id: 1, name: 'Test User' };
      userRepo.getUserById.mockResolvedValue(user);

      const result = await userService.getUserById(1);
      expect(result).toEqual(user);
    });
  });

  describe('deleteUser', () => {
    it('should call softDeleteUser with correct id', async () => {
      userRepo.softDeleteUser.mockResolvedValue(true);

      const result = await userService.deleteUser(1);
      expect(userRepo.softDeleteUser).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });
  });

  describe('findByEmail', () => {
    it('should throw if email not provided', async () => {
      await expect(userService.findByEmail({})).rejects.toThrow();
    });

    it('should throw if user not found', async () => {
      userRepo.findByEmail.mockResolvedValue(null);

      await expect(userService.findByEmail({ email: 'test@example.com' })).rejects.toThrow();
    });

    it('should return user if found', async () => {
      const user = { id: 1, email: 'test@example.com' };
      userRepo.findByEmail.mockResolvedValue(user);

      const result = await userService.findByEmail({ email: 'test@example.com' });
      expect(result).toEqual(user);
    });
  });

  // Add more tests for other methods if needed
});
