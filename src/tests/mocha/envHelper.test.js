const assert = require('assert');
const envHelper = require('../../utils/envHelper');

describe('envHelper falsy values', () => {
  beforeEach(() => {
    process.env = { ...process.env };
  });

  before(() => {
    // Backup original env before tests
    originalEnv = { ...process.env };
  });

  beforeEach(() => {
    // Reset process.env before each test
    process.env = { ...originalEnv };
    // Mock your env var fresh
    process.env.TEST_VAR = 'testValue';
  });

  afterEach(() => {
    // Restore after each test to avoid side effects
    process.env = { ...originalEnv };
  });

  it('should return the environment variable if it exists', () => {
    const value = envHelper.getEnv('TEST_VAR');
    assert.strictEqual(value, 'testValue');
  });

  it('should return the default value if the environment variable does not exist', () => {
    const defaultVal = 'defaultValue';
    const value = envHelper.getEnv('NON_EXISTENT_VAR', defaultVal);
    assert.strictEqual(value, defaultVal);
  });

  it('should return null if environment variable not set and no default provided', () => {
    const value = envHelper.getEnv('ANOTHER_NON_EXISTENT_VAR');
    assert.strictEqual(value, null);
  });
});
