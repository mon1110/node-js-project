// src/tests/settingsUtil.test.js

const { getAuthConfig } = require('../utils/settingsUtil');

jest.mock('../models/Settings', () => ({
  Settings: {
    findAll: jest.fn()
  }
}));

const { Settings } = require('../models/Settings');

describe('getAuthConfig', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return parsed config with numeric values', async () => {
    Settings.findAll.mockResolvedValue([
      { key: 'maxLoginAttempts', value: '4' },
      { key: 'blockDurationMinutes', value: '10' }
    ]);

    const config = await getAuthConfig();

    expect(config).toEqual({
      maxAttempts: 4,
      blockDurationMs: 10 * 60 * 1000
    });
  });

  it('should use default values if settings are missing', async () => {
    Settings.findAll.mockResolvedValue([]);

    const config = await getAuthConfig();

    expect(config).toEqual({
      maxAttempts: 5,
      blockDurationMs: 5 * 60 * 1000
    });
  });

  it('should handle string values correctly (non-numeric)', async () => {
    Settings.findAll.mockResolvedValue([
      { key: 'maxLoginAttempts', value: 'abc' },
      { key: 'blockDurationMinutes', value: 'xyz' }
    ]);

    const config = await getAuthConfig();

    expect(config).toEqual({
      maxAttempts: 'abc',
      blockDurationMs: ('xyz' || 5) * 60 * 1000 
    });
  });
});
