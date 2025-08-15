// // // src/tests/schedulerService.test.js

// // // ✅ Mock db.config.js before anything else
// // jest.mock('../config/db.config', () => ({
// //     define: jest.fn(() => ({})),
// //     authenticate: jest.fn(),
// //     sync: jest.fn(),
// //     close: jest.fn()
// //   }));
  
// //   // ✅ Mock models used inside userRepo
// //   jest.mock('../models/User', () => {
// //     const MockUser = {};
// //     MockUser.findOne = jest.fn();
// //     MockUser.update = jest.fn();
// //     return MockUser;
// //   });
  
// //   jest.mock('../models/menu', () => ({}));
  
// //   // ✅ Now import modules
// //   const schedulerService = require('../Service/schedulerService');
// //   const userRepo = require('../repository/userRepository');
  
// //   describe('schedulerService', () => {
// //     beforeEach(() => {
// //       jest.clearAllMocks();
// //     });
  
// //     it('should schedule and run job when user is found', async () => {
// //       const mockUser = { name: 'John', email: 'john@example.com' };
// //       const unblockTime = new Date(Date.now() + 1000); // 1 sec in future
  
// //       userRepo.findByEmail = jest.fn().mockResolvedValue(mockUser);
// //       userRepo.updateByEmail = jest.fn().mockResolvedValue();
  
// //       const jobKey = await schedulerService.scheduleUserUnblock(mockUser, new Date(Date.now() + 10));
  
// //       // Wait briefly and trigger manual test callback
// //       await new Promise(r => setTimeout(r, 20));
// //       await schedulerService.__triggerUnblockJobManually();
  
// //       expect(userRepo.findByEmail).toHaveBeenCalledWith(mockUser.email);
// //       expect(userRepo.updateByEmail).toHaveBeenCalledWith(mockUser.email, { failedAttempts: 0 });
// //       expect(jobKey).toMatch(/^unblock-John-/);
// //     });
  
// //     it('should skip update when user is not found', async () => {
// //       const mockUser = { name: 'Ghost', email: 'ghost@example.com' };
// //       userRepo.findByEmail = jest.fn().mockResolvedValue(null);
// //       userRepo.updateByEmail = jest.fn();
  
// //       await schedulerService.scheduleUserUnblock(mockUser, new Date(Date.now() + 10));
// //       await new Promise(r => setTimeout(r, 20));
// //       await schedulerService.__triggerUnblockJobManually();
  
// //       expect(userRepo.findByEmail).toHaveBeenCalledWith(mockUser.email);
// //       expect(userRepo.updateByEmail).not.toHaveBeenCalled();
// //     });
// //   });
  
// // test/mocha/schedulerService.test.js
// const { expect } = require('chai');
// const sinon = require('sinon');

// //  Stubs for db.config.js
// const dbConfig = require('../config/db.config');
// sinon.stub(dbConfig, 'define').returns({});
// sinon.stub(dbConfig, 'authenticate').resolves();
// sinon.stub(dbConfig, 'sync').resolves();
// sinon.stub(dbConfig, 'close').resolves();

// // Stubs for models
// require('../../models/menu'); // just to avoid require errors
// const UserModel = require('../../models/User');
// sinon.stub(UserModel, 'findOne');
// sinon.stub(UserModel, 'update');

// //  Import modules after mocks
// const schedulerService = require('../Service/schedulerService');
// const userRepo = require('../repository/userRepository');

// describe('schedulerService', () => {
//   beforeEach(() => {
//     sinon.restore();
//     // Re-stub after restore
//     sinon.stub(dbConfig, 'define').returns({});
//     sinon.stub(dbConfig, 'authenticate').resolves();
//     sinon.stub(dbConfig, 'sync').resolves();
//     sinon.stub(dbConfig, 'close').resolves();
//     sinon.stub(UserModel, 'findOne');
//     sinon.stub(UserModel, 'update');
//   });

//   afterEach(() => {
//     sinon.restore();
//   });

//   it('should schedule and run job when user is found', async () => {
//     const mockUser = { name: 'John', email: 'john@example.com' };

//     const findStub = sinon.stub(userRepo, 'findByEmail').resolves(mockUser);
//     const updateStub = sinon.stub(userRepo, 'updateByEmail').resolves();

//     const jobKey = await schedulerService.scheduleUserUnblock(mockUser, new Date(Date.now() + 10));

//     await new Promise(r => setTimeout(r, 20));
//     await schedulerService.__triggerUnblockJobManually();

//     expect(findStub.calledWith(mockUser.email)).to.be.true;
//     expect(updateStub.calledWith(mockUser.email, { failedAttempts: 0 })).to.be.true;
//     expect(jobKey).to.match(/^unblock-John-/);
//   });

//   it('should skip update when user is not found', async () => {
//     const mockUser = { name: 'Ghost', email: 'ghost@example.com' };

//     const findStub = sinon.stub(userRepo, 'findByEmail').resolves(null);
//     const updateStub = sinon.stub(userRepo, 'updateByEmail');

//     await schedulerService.scheduleUserUnblock(mockUser, new Date(Date.now() + 10));

//     await new Promise(r => setTimeout(r, 20));
//     await schedulerService.__triggerUnblockJobManually();

//     expect(findStub.calledWith(mockUser.email)).to.be.true;
//     expect(updateStub.called).to.be.false;
//   });
// });

// test file: src/tests/mocha/envHelper.test.js
const { expect } = require('chai');
const proxyquire = require('proxyquire').noCallThru();

// Mocked DB config module
const mockDbConfig = {
  getAuthConfig: async () => ({
    maxAttempts: 4,
    blockDurationMs: 30000
  })
};

// Import schedulerService with mocked db.config
const myService = proxyquire('../Service/schedulerService', {
  '../config/db.config': mockDbConfig
});

describe('Mocha test with proxyquire', () => {
  it('should use mocked DB config', async () => {
    // Call the function in schedulerService that internally uses db.config.getAuthConfig
    const config = await myService.getAuthConfig(); // <-- adjust to your actual function

    expect(config).to.have.property('maxAttempts', 4);
    expect(config).to.have.property('blockDurationMs', 30000);
  });
});
