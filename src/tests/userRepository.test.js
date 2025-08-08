// src/tests/userRepository.test.js

// Mock the db config to avoid 'db.define is not a function' error
jest.mock('../config/db.config', () => ({
    define: jest.fn(() => ({})),
    authenticate: jest.fn().mockResolvedValue(),
    sync: jest.fn().mockResolvedValue(),
    close: jest.fn().mockResolvedValue(),
    transaction: jest.fn(() => Promise.resolve({
      commit: jest.fn(),
      rollback: jest.fn(),
    })),
  }));
  
  // Mock models
  jest.mock('../models/User', () => ({
    create: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    findAll: jest.fn(),
    upsert: jest.fn(),
    bulkCreate: jest.fn(),
    save: jest.fn(),
  }));
  
  jest.mock('../models/menu', () => ({
    findAll: jest.fn(),
  }));
  
  jest.mock('bcrypt');
  
  const userRepo = require('../repository/userRepository');
  const User = require('../models/User');
  const menu = require('../models/menu');
  const bcrypt = require('bcrypt');
  
  describe('User Repository', () => {
  
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    describe('createUser', () => {
      it('should create a new user', async () => {
        const mockUser = { name: 'John', email: 'john@example.com' };
        User.create.mockResolvedValue(mockUser);
  
        const result = await userRepo.createUser(mockUser);
  
        expect(User.create).toHaveBeenCalledWith(mockUser);
        expect(result).toBe(mockUser);
      });
    });
  
    describe('findByEmail', () => {
      it('should return a user by email', async () => {
        const email = 'jane@example.com';
        const mockUser = { id: 1, email };
  
        User.findOne.mockResolvedValue(mockUser);
  
        const result = await userRepo.findByEmail(email);
  
        expect(User.findOne).toHaveBeenCalledWith({
          where: { email: email.toLowerCase(), softDelete: false }
        });
        expect(result).toBe(mockUser);
      });
  
      it('should return null if email is invalid', async () => {
        const result = await userRepo.findByEmail(null);
        expect(result).toBeNull();
      });
    });
  
    describe('updatePassword', () => {
      it('should hash and update the password', async () => {
        const id = 1;
        const rawPassword = 'plainText';
        const hashedPassword = 'hashedPass';
  
        bcrypt.hash.mockResolvedValue(hashedPassword);
        User.update.mockResolvedValue([1]);
  
        const result = await userRepo.updatePassword(id, rawPassword);
  
        expect(bcrypt.hash).toHaveBeenCalledWith(rawPassword, 10);
        expect(User.update).toHaveBeenCalledWith(
          { password: hashedPassword },
          { where: { id } }
        );
        expect(result).toEqual([1]);
      });
    });
  
    describe('softDeleteUser', () => {
      it('should soft delete a user', async () => {
        const id = 2;
        const mockResponse = 1;
  
        // Note: userRepo.softDeleteUser returns deleted count (first element of update array)
        User.update.mockResolvedValue([mockResponse]);
  
        const result = await userRepo.softDeleteUser(id);
  
        expect(User.update).toHaveBeenCalledWith(
          { softDelete: true },
          { where: { id }, returning: true }
        );
        expect(result).toBe(mockResponse);
      });
    });
  
    describe('findAll', () => {
      it('should fetch all non-deleted users with subUsers', async () => {
        const mockUsers = [
          {
            id: 1,
            name: 'Admin',
            subUsers: [{ id: 2, name: 'Sub1' }]
          }
        ];
  
        User.findAll.mockResolvedValue(mockUsers);
  
        const result = await userRepo.findAll();
  
        expect(User.findAll).toHaveBeenCalledWith({
          where: { softDelete: false },
          include: [
            {
              model: User,
              as: 'subUsers',
              attributes: ['id', 'name', 'email', 'gender']
            }
          ]
        });
  
        expect(result).toBe(mockUsers);
      });
    });
  
  
  });
  