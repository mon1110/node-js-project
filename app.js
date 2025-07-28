// Load environment variables
require('dotenv').config();

// Importing core modules
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
// require('./src/schedules/loggerScheduler'); 
require('./src/schedules/date');

// Importing packages
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./src/config/swagger.config');
const sequelize = require('./src/config/db.config');
const Routes = require('./src/routes/index');
const errorHandler = require('./src/middlewares/errorHandler');
const { Settings } = require('./src/models');

// 🔹 Import models before sync to register indexes
const UserModel = require('./src/models/User');
require('./src/models/product'); // add other models as needed

// Sync DB and Insert Default Settings
sequelize.sync({ alter: true }) // use force: true only in development
  .then(async () => {
    console.log('All tables & indexes synced!');

    // Insert default settings if not exist
    const count = await Settings.count();
    if (count === 0) {
      await Settings.bulkCreate([
        { key: 'maxLoginAttempts', value: '5' },
        { key: 'blockDurationMinutes', value: '5' },
        ]);
      console.log(' Default settings inserted');
    }

  })
  .catch((err) => {
    console.error(' DB Sync error:', err);
  });

// Import RabbitMQ consumer
const { connectQueue } = require('./src/Service/rmqService');

// Initialize express app
const app = express();

// Set up CORS
app.use(cors());

// Middleware to parse request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', Routes);
app.use('/users', require('./src/routes/userRoutes')); // user routes

// Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Auto-create folders
['./data', './uploads', './files'].forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath);
  }
});

// Error handler (keep last)
app.use(errorHandler);

// Define PORT
const PORT = process.env.PORT || 8080;

// Start Express + RabbitMQ consumer
const startServer = async () => {
  await connectQueue();
};

// Start server
app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
  console.log(` Swagger docs at http://localhost:${PORT}/api-docs`);
  startServer();
});
