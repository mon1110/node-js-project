const axios = require('axios');
const MessageConstant = require('../constants/MessageConstant');

const handleRequest = async (req) => {
  const { method, url, data } = req
  if(!url) throw new Error(res, users, MessageConstant.USER.URL_IS_REQUIRED)

  try {
    const options = { method, url, data, headers: { 'Content-Type': 'application/json' } };

    const response = await axios(options);
    return response.data;
  } catch (err) {
    console.error('Axios Error:', err.response?.data || err.message);
    throw err;
  }
};

module.exports = { handleRequest };
