const axios = require('axios');

const handleRequest = async (method, url, data) => {
  if (!url) throw new Error('URL is required');

  try {
    const options = {method,url,data,headers: { 'Content-Type': 'application/json' }};

    const response = await axios(options);
    return response.data;
  } catch (err) {
    console.error('Axios Error:', err.response?.data || err.message);
    throw err;
  }
};

module.exports = { handleRequest };
