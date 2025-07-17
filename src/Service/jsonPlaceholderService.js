const axios = require('axios');
const BASE_URL = 'https://jsonplaceholder.typicode.com';

const handleRequest = async (method, id, data) => {
  let url = `${BASE_URL}/posts`;
  if (id) url += `/${id}`;

  const options = {
    method,
    url,
    data,
    headers: { 'Content-Type': 'application/json' }
  };

  const response = await axios(options);
  return response.data;
};

module.exports = { handleRequest };
