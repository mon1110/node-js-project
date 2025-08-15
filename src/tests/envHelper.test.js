// test/envHelper.falsy.test.js
const assert = require('assert');
const sinon = require('sinon');
const { expect } = require('chai');
const envHelper = require('../utils/envHelper');

let originalEnv;

describe('envHelper falsy values', () => {
  before(() => {
    // Backup original process.env before tests
    originalEnv = { ...process.env };
  });

  beforeEach(() => {
    // Reset process.env to the original before each test
    process.env = { ...originalEnv };

    // Stub process.env to inject a test variable
    sinon.stub(process, 'env').value({
      ...originalEnv,
      TEST_VAR: 'testValue',
    });
  });

  afterEach(() => {
    // Restore stubs after each test
    sinon.restore();
  });

  it('should read the mocked env variable', () => {
    expect(process.env.TEST_VAR).to.equal('testValue');
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
