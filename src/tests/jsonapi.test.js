const sinon = require('sinon');
const { expect } = require('chai');
const axios = require('axios');
const { handleRequest } = require('../Service/jsonapi'); // adjust path

describe('handleRequest', () => {
  let axiosStub;

  beforeEach(() => {
    // Stub axios itself (function), not axios.request
    axiosStub = sinon.stub(axios, 'request').callsFake((config) => {
      return Promise.resolve({ data: {} }); // default fake
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return data on first attempt', async () => {
    axiosStub.resolves({ data: { success: true } });

    const result = await handleRequest('GET', 'http://example.com');
    expect(result).to.deep.equal({ success: true });
    expect(axiosStub.calledOnce).to.be.true;
  });

  it('should retry and succeed on second attempt', async () => {
    axiosStub.onFirstCall().rejects(new Error('Network error'));
    axiosStub.onSecondCall().resolves({ data: { success: true } });

    const result = await handleRequest('GET', 'http://example.com', null, 2, 10);
    expect(result).to.deep.equal({ success: true });
    expect(axiosStub.callCount).to.equal(2);
  });

  it('should fail after all retries', async () => {
    axiosStub.rejects(new Error('Network error'));

    try {
      await handleRequest('GET', 'http://example.com', null, 2, 10);
      throw new Error('This should not run');
    } catch (err) {
      expect(err.message).to.include('Request failed after 2 attempts');
    }
    expect(axiosStub.callCount).to.equal(2);
  });
});
