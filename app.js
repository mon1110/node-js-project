// Load environment variables
require('dotenv').config();

// Importing core modules
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
require('./src/schedules/loggerScheduler'); 
require('./src/schedules/date'); 


// Importing packages
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./src/config/swagger.config');
const sequelize = require('./src/config/db.config');
const Routes = require('./src/routes/index');
const errorHandler = require('./src/middlewares/errorHandler');

// Import mail queue handlers from service
const { connectQueue } = require('./src/Service/rmqService'); 

// Initialize express app
const app = express();

// Set up CORS
app.use(cors());

// Middleware to parse request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Sync database
sequelize.sync({ alter: true })
  .then(() => console.log('✅ Database synced'))
  .catch((err) => console.error('❌ DB Sync error:', err));

// Auto-create folders if not present
['./data', './uploads', './files'].forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath);
  }
});

// Route registration
app.use('/api', Routes);
app.use('/users', require('./src/routes/userRoutes')); // user routes

// Error handler (keep this last)
app.use(errorHandler);

// Define PORT
const PORT = process.env.PORT || 8080;

// Start Express + RabbitMQ consumer
const startServer = async () => {
  await connectQueue();     // ✅ RabbitMQ connection
  //consumeMailQueue();       // ✅ Start consuming mail jobs
};

// Start server
app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
  console.log(` Swagger docs at http://localhost:${PORT}/api-docs`);
  startServer(); // Call after server starts
});
