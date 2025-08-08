// jsonapi.test.js

const axios = require('axios');
const { handleRequest } = require('../Service/jsonapi'); // Update path if needed
const MessageConstant = require('../constants/MessageConstant');

jest.mock('axios');

describe('handleRequest', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return data on successful request', async () => {
    axios.mockResolvedValue({ data: { success: true } });

    const result = await handleRequest('GET', 'https://api.example.com');
    expect(result).toEqual({ success: true });
    expect(axios).toHaveBeenCalledTimes(1);
  });

  it('should retry on failure and succeed on 2nd attempt', async () => {
    axios
      .mockRejectedValueOnce(new Error('Network Error'))
      .mockResolvedValueOnce({ data: { success: true } });

    const result = await handleRequest('GET', 'https://api.example.com');
    expect(result).toEqual({ success: true });
    expect(axios).toHaveBeenCalledTimes(2);
  });

  it('should throw error after all retries fail', async () => {
    axios.mockRejectedValue(new Error('Network Error'));

    await expect(handleRequest('POST', 'https://api.example.com', { key: 'value' }, 2))
      .rejects
      .toThrow(MessageConstant.REQUEST.FAILED);

    expect(axios).toHaveBeenCalledTimes(2);
  });
});
