// tests/utils/Res.test.js

const Res = require('../utils/Res');

describe('Res utility class', () => {
  let res;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  it('should send success response', () => {
    Res.success(res, { message: 'Success' }, 'Operation successful', 200, 'token123');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      data: { message: 'Success' },
      token: 'token123',
      status: {
        status: 'ok',
        code: 200,
        description: 'Operation successful'
      }
    });
  });

  it('should send error response', () => {
    Res.error(res, 'Some error', { error: true }, 500);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      data: { error: true },
      status: {
        status: 'error',
        code: 500,
        description: 'Some error'
      }
    });
  });

  it('should send created response', () => {
    Res.created(res, { created: true }, 'Resource created');
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      data: { created: true },
      status: {
        status: 'ok',
        code: 201,
        description: 'Resource created'
      }
    });
  });

  it('should send bad request response', () => {
    Res.badRequest(res, 'Invalid input', { error: 'bad' });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      data: { error: 'bad' },
      status: {
        status: 'error',
        code: 400,
        description: 'Invalid input'
      }
    });
  });

  it('should send unauthorized response', () => {
    Res.unauthorized(res, 'No access', { error: 'unauthorized' });
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      data: { error: 'unauthorized' },
      status: {
        status: 'error',
        code: 401,
        description: 'No access'
      }
    });
  });

  it('should send not found response', () => {
    Res.notFound(res, 'Resource missing', { missing: true });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      data: { missing: true },
      status: {
        status: 'error',
        code: 404,
        description: 'Resource missing'
      }
    });
  });

  it('should send no content response', () => {
    Res.noContent(res, 'Nothing to return');
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.json).toHaveBeenCalledWith({
      data: {},
      status: {
        status: 'ok',
        code: 204,
        description: 'Nothing to return'
      }
    });
  });

  it('should send prepared api response via sendResponse', () => {
    const apiResponse = {
      status: {
        code: 201,
        description: 'Created',
        status: 'ok'
      },
      data: { id: 1 }
    };

    Res.sendResponse(res, apiResponse);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(apiResponse);
  });
});
