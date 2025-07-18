const axios = require('axios');
const MessageConstant = require('../constants/MessageConstant');

const retryCountMap = new Map();

const handleRequest = async (req, maxRetries = 3) => {
  const { method, url, data } = req;

  if (!url) throw new Error(MessageConstant.USER.URL_IS_REQUIRED);

  const key = `${method}_${url}`;
  let attempt = retryCountMap.get(key) || 0;

  if (attempt >= maxRetries) {
    retryCountMap.delete(key); 
    throw new Error(MessageConstant.USER.EXTERNAL_API_ERROR);
  }

  try {
    const response = await axios({method,url,data,headers: { 'Content-Type': 'application/json' },});

    retryCountMap.delete(key); 
    return response.data;

  } catch (err) {
    attempt++;
    retryCountMap.set(key, attempt);
    
    if (attempt >= maxRetries) {
      throw new Error(MessageConstant.USER.EXTERNAL_API_ERROR);
    }

    throw new Error(MessageConstant.USER.RETRY_ATTEMPT_FAILED(attempt));
  }
};

module.exports = { handleRequest };
