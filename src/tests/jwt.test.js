const jwt = require('jsonwebtoken');

// JWT functions ko mock kar rahe hain
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

const JWT_SECRET = 'test-secret';

// Aapke JWT helper functions ka simulation
const jwtHelper = {
  generateToken: (payload) => jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }),
  verifyToken: (token) => jwt.verify(token, JWT_SECRET),
};

describe('JWT Helper', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should generate token using jwt.sign', () => {
    const payload = { id: 1 };
    jwt.sign.mockReturnValue('mocked-token');

    const token = jwtHelper.generateToken(payload);

    expect(token).toBe('mocked-token');
    expect(jwt.sign).toHaveBeenCalledWith(payload, JWT_SECRET, { expiresIn: '1h' });
  });

  it('should verify token using jwt.verify', () => {
    const token = 'mocked-token';
    const decoded = { id: 1 };
    jwt.verify.mockReturnValue(decoded);

    const result = jwtHelper.verifyToken(token);

    expect(result).toEqual(decoded);
    expect(jwt.verify).toHaveBeenCalledWith(token, JWT_SECRET);
  });

  it('should throw error if token is invalid', () => {
    jwt.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    expect(() => jwtHelper.verifyToken('bad-token')).toThrow('Invalid token');
  });
});
