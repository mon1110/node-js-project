const axios = require('axios');
const MessageConstant = require('../constants/MessageConstant');

const handleRequest = async (method, url, data = null, retries = 3) => {
  let attempt = 0;

  while (attempt < retries) {
    try {
      const config = {
        method: method.toLowerCase(),url,data,timeout: 5000,  };

      const response = await axios(config);
      return response.data;

    } catch (error) {
      attempt++;
      console.log(`Attempt ${attempt} failed. Retrying...`);

      if (attempt === retries) {
        console.error(`All ${retries} attempts failed.`);
        throw new Error(MessageConstant.REQUEST.FAILED);
      }
    }
  }
};

module.exports = { handleRequest };
