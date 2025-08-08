// src/tests/schedulerService.test.js

// ✅ Mock db.config.js before anything else
jest.mock('../config/db.config', () => ({
    define: jest.fn(() => ({})),
    authenticate: jest.fn(),
    sync: jest.fn(),
    close: jest.fn()
  }));
  
  // ✅ Mock models used inside userRepo
  jest.mock('../models/User', () => {
    const MockUser = {};
    MockUser.findOne = jest.fn();
    MockUser.update = jest.fn();
    return MockUser;
  });
  
  jest.mock('../models/menu', () => ({}));
  
  // ✅ Now import modules
  const schedulerService = require('../Service/schedulerService');
  const userRepo = require('../repository/userRepository');
  
  describe('schedulerService', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    it('should schedule and run job when user is found', async () => {
      const mockUser = { name: 'John', email: 'john@example.com' };
      const unblockTime = new Date(Date.now() + 1000); // 1 sec in future
  
      userRepo.findByEmail = jest.fn().mockResolvedValue(mockUser);
      userRepo.updateByEmail = jest.fn().mockResolvedValue();
  
      const jobKey = await schedulerService.scheduleUserUnblock(mockUser, new Date(Date.now() + 10));
  
      // Wait briefly and trigger manual test callback
      await new Promise(r => setTimeout(r, 20));
      await schedulerService.__triggerUnblockJobManually();
  
      expect(userRepo.findByEmail).toHaveBeenCalledWith(mockUser.email);
      expect(userRepo.updateByEmail).toHaveBeenCalledWith(mockUser.email, { failedAttempts: 0 });
      expect(jobKey).toMatch(/^unblock-John-/);
    });
  
    it('should skip update when user is not found', async () => {
      const mockUser = { name: 'Ghost', email: 'ghost@example.com' };
      userRepo.findByEmail = jest.fn().mockResolvedValue(null);
      userRepo.updateByEmail = jest.fn();
  
      await schedulerService.scheduleUserUnblock(mockUser, new Date(Date.now() + 10));
      await new Promise(r => setTimeout(r, 20));
      await schedulerService.__triggerUnblockJobManually();
  
      expect(userRepo.findByEmail).toHaveBeenCalledWith(mockUser.email);
      expect(userRepo.updateByEmail).not.toHaveBeenCalled();
    });
  });
  