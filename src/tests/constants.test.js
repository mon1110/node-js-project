// constantsCoverage.test.js
const MessageConstant = require('../constants/MessageConstant');

describe('MessageConstant function coverage', () => {
  it('should return correct retry attempt failed message', () => {
    const msg = MessageConstant.USER.RETRY_ATTEMPT_FAILED(2);
    expect(msg).toBe('Attempt 2 failed. Please retry.');
  });

  it('should return correct invalid credential with count message', () => {
    const msg = MessageConstant.USER.INVALID_CREDENTIAL_WITH_COUNT(3, 5);
    expect(msg).toBe('Invalid credentials. (3/5)');
  });

  it('should return correct blocked with timer message', () => {
    const msg = MessageConstant.USER.BLOCKED_WITH_TIMER(10);
    expect(msg).toBe('Account is blocked. Try again in 10 minute(s).');
  });
});
