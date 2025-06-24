const swaggerJsDoc = require('swagger-jsdoc');
const path = require('path'); // Add this

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'My API',
      version: '1.0.0',
      description: 'API documentation for my Node.js MVC application',
    },
    servers: [
      {
        url: 'http://localhost:3333', // Replace with your server URL
      },
    ],
  },

  apis: [path.join(__dirname, '../docs/*.yaml')],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = swaggerDocs;