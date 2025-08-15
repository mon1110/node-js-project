// // tests/utils/Res.test.js

// const Res = require('../utils/Res');

// describe('Res utility class', () => {
//   let res;

//   beforeEach(() => {
//     res = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn()
//     };
//   });

//   it('should send success response', () => {
//     Res.success(res, { message: 'Success' }, 'Operation successful', 200, 'token123');
//     expect(res.status).toHaveBeenCalledWith(200);
//     expect(res.json).toHaveBeenCalledWith({
//       data: { message: 'Success' },
//       token: 'token123',
//       status: {
//         status: 'ok',
//         code: 200,
//         description: 'Operation successful'
//       }
//     });
//   });

//   it('should send error response', () => {
//     Res.error(res, 'Some error', { error: true }, 500);
//     expect(res.status).toHaveBeenCalledWith(500);
//     expect(res.json).toHaveBeenCalledWith({
//       data: { error: true },
//       status: {
//         status: 'error',
//         code: 500,
//         description: 'Some error'
//       }
//     });
//   });

//   it('should send created response', () => {
//     Res.created(res, { created: true }, 'Resource created');
//     expect(res.status).toHaveBeenCalledWith(201);
//     expect(res.json).toHaveBeenCalledWith({
//       data: { created: true },
//       status: {
//         status: 'ok',
//         code: 201,
//         description: 'Resource created'
//       }
//     });
//   });

//   it('should send bad request response', () => {
//     Res.badRequest(res, 'Invalid input', { error: 'bad' });
//     expect(res.status).toHaveBeenCalledWith(400);
//     expect(res.json).toHaveBeenCalledWith({
//       data: { error: 'bad' },
//       status: {
//         status: 'error',
//         code: 400,
//         description: 'Invalid input'
//       }
//     });
//   });

//   it('should send unauthorized response', () => {
//     Res.unauthorized(res, 'No access', { error: 'unauthorized' });
//     expect(res.status).toHaveBeenCalledWith(401);
//     expect(res.json).toHaveBeenCalledWith({
//       data: { error: 'unauthorized' },
//       status: {
//         status: 'error',
//         code: 401,
//         description: 'No access'
//       }
//     });
//   });

//   it('should send not found response', () => {
//     Res.notFound(res, 'Resource missing', { missing: true });
//     expect(res.status).toHaveBeenCalledWith(404);
//     expect(res.json).toHaveBeenCalledWith({
//       data: { missing: true },
//       status: {
//         status: 'error',
//         code: 404,
//         description: 'Resource missing'
//       }
//     });
//   });

//   it('should send no content response', () => {
//     Res.noContent(res, 'Nothing to return');
//     expect(res.status).toHaveBeenCalledWith(204);
//     expect(res.json).toHaveBeenCalledWith({
//       data: {},
//       status: {
//         status: 'ok',
//         code: 204,
//         description: 'Nothing to return'
//       }
//     });
//   });

//   it('should send prepared api response via sendResponse', () => {
//     const apiResponse = {
//       status: {
//         code: 201,
//         description: 'Created',
//         status: 'ok'
//       },
//       data: { id: 1 }
//     };

//     Res.sendResponse(res, apiResponse);
//     expect(res.status).toHaveBeenCalledWith(201);
//     expect(res.json).toHaveBeenCalledWith(apiResponse);
//   });
// });




// tests/mocha/Res.test.js
const { expect } = require('chai');
const sinon = require('sinon');
const Res = require('../utils/Res');

describe('Res utility class', () => {
  let res;

  beforeEach(() => {
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub()
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should send success response', () => {
    Res.success(res, { message: 'Success' }, 'Operation successful', 200, 'token123');

    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledWith({
      data: { message: 'Success' },
      token: 'token123',
      status: {
        status: 'ok',
        code: 200,
        description: 'Operation successful'
      }
    })).to.be.true;
  });

  it('should send error response', () => {
    Res.error(res, 'Some error', { error: true }, 500);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWith({
      data: { error: true },
      status: {
        status: 'error',
        code: 500,
        description: 'Some error'
      }
    })).to.be.true;
  });

  it('should send created response', () => {
    Res.created(res, { created: true }, 'Resource created');

    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.calledWith({
      data: { created: true },
      status: {
        status: 'ok',
        code: 201,
        description: 'Resource created'
      }
    })).to.be.true;
  });

  it('should send bad request response', () => {
    Res.badRequest(res, 'Invalid input', { error: 'bad' });

    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWith({
      data: { error: 'bad' },
      status: {
        status: 'error',
        code: 400,
        description: 'Invalid input'
      }
    })).to.be.true;
  });

  it('should send unauthorized response', () => {
    Res.unauthorized(res, 'No access', { error: 'unauthorized' });

    expect(res.status.calledWith(401)).to.be.true;
    expect(res.json.calledWith({
      data: { error: 'unauthorized' },
      status: {
        status: 'error',
        code: 401,
        description: 'No access'
      }
    })).to.be.true;
  });

  it('should send not found response', () => {
    Res.notFound(res, 'Resource missing', { missing: true });

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWith({
      data: { missing: true },
      status: {
        status: 'error',
        code: 404,
        description: 'Resource missing'
      }
    })).to.be.true;
  });

  it('should send no content response', () => {
    Res.noContent(res, 'Nothing to return');

    expect(res.status.calledWith(204)).to.be.true;
    expect(res.json.calledWith({
      data: {},
      status: {
        status: 'ok',
        code: 204,
        description: 'Nothing to return'
      }
    })).to.be.true;
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

    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.calledWith(apiResponse)).to.be.true;
  });
});
