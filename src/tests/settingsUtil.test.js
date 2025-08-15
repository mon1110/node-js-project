// // src/tests/settingsUtil.test.js

// const { getAuthConfig } = require('../utils/settingsUtil');

// jest.mock('../models/Settings', () => ({
//   Settings: {
//     findAll: jest.fn()
//   }
// }));

// const { Settings } = require('../models/Settings');

// describe('getAuthConfig', () => {
//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   it('should return parsed config with numeric values', async () => {
//     Settings.findAll.mockResolvedValue([
//       { key: 'maxLoginAttempts', value: '4' },
//       { key: 'blockDurationMinutes', value: '10' }
//     ]);

//     const config = await getAuthConfig();

//     expect(config).toEqual({
//       maxAttempts: 4,
//       blockDurationMs: 10 * 60 * 1000
//     });
//   });

//   it('should use default values if settings are missing', async () => {
//     Settings.findAll.mockResolvedValue([]);

//     const config = await getAuthConfig();

//     expect(config).toEqual({
//       maxAttempts: 5,
//       blockDurationMs: 5 * 60 * 1000
//     });
//   });

//   it('should handle string values correctly (non-numeric)', async () => {
//     Settings.findAll.mockResolvedValue([
//       { key: 'maxLoginAttempts', value: 'abc' },
//       { key: 'blockDurationMinutes', value: 'xyz' }
//     ]);

//     const config = await getAuthConfig();

//     expect(config).toEqual({
//       maxAttempts: 'abc',
//       blockDurationMs: ('xyz' || 5) * 60 * 1000 
//     });
//   });
// });

// test/mocha/settingsUtil.test.js
const { expect } = require('chai');
const sinon = require('sinon');

const { getAuthConfig } = require('../utils/settingsUtil');
const SettingsModel = require('../models/Settings');  // directly model

describe('getAuthConfig', () => {
  let findAllStub;

  beforeEach(() => {
    findAllStub = sinon.stub(SettingsModel, 'findAll');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return parsed config with numeric values', async () => {
    findAllStub.resolves([
      { key: 'maxLoginAttempts', value: '4' },
      { key: 'blockDurationMinutes', value: '10' }
    ]);

    const config = await getAuthConfig();

    expect(config).to.deep.equal({
      maxAttempts: 4,
      blockDurationMs: 10 * 60 * 1000
    });
  });

  it('should use default values if settings are missing', async () => {
    findAllStub.resolves([]);

    const config = await getAuthConfig();

    expect(config).to.deep.equal({
      maxAttempts: 5,
      blockDurationMs: 5 * 60 * 1000
    });
  });

  it('should handle string values correctly (non-numeric)', async () => {
    findAllStub.resolves([
      { key: 'maxLoginAttempts', value: 'abc' },
      { key: 'blockDurationMinutes', value: 'xyz' }
    ]);

    const config = await getAuthConfig();

    expect(config.maxAttempts).to.equal('abc');
    expect(Number.isNaN(config.blockDurationMs)).to.be.true;
  });
});
