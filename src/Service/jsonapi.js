// const axios = require('axios');
// const MessageConstant = require('../constants/MessageConstant');

// const handleRequest = async (method, url, data = null, retries = 3) => {
//   let attempt = 0;

//   while (attempt < retries) {
//     try {
//       const config = {
//         method: method.toLowerCase(),url,data,timeout: 5000,  };

//       const response = await axios(config);
//       return response.data;

//     } catch (error) {
//       attempt++;
//       console.log(`Attempt ${attempt} failed. Retrying...`);

//       if (attempt === retries) {
//         // console.error(`All ${retries} attempts failed.`);
//         throw new Error(MessageConstant.REQUEST.FAILED);
//       }
//     }
//   }
// };

// module.exports = { handleRequest };


const axios = require('axios');

const handleRequest = async (method, url, data = null, retries = 3, delayMs = 500) => {
  let attempt = 0;

  while (attempt < retries) {
    try {
      console.log(`[handleRequest] Attempt ${attempt + 1}/${retries} | Method: ${method} | URL: ${url}`);

      const config = { method: method.toLowerCase(), url };
      if (method.toLowerCase() !== 'get' && data) {
        config.data = data;
      }

      const response = await axios.request(config); // <- changed to axios.request

      console.log(`[handleRequest] Success on attempt ${attempt + 1}`);
      return response.data;

    } catch (err) {
      attempt++;
      console.error(`[handleRequest] Attempt ${attempt} failed: ${err.message || err}`);

      if (attempt >= retries) {
        console.error(`[handleRequest] All ${retries} attempts failed.`);
        throw new Error(`Request failed after ${retries} attempts: ${err.message || 'Network error'}`);
      }

      console.log(`[handleRequest] Retrying in ${delayMs}ms...`);
      await new Promise(res => setTimeout(res, delayMs));
    }
  }
};

module.exports = { handleRequest };
