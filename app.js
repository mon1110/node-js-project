// Importing modules
const express = require('express');
const dotenv = require('dotenv').config();
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./src/config/swagger.config');
const { User, menu } = require('./src/models');
const sequelize = require('./src/config/db.config'); 
const Routes = require('./src/routes/index');
// const cors = require('cors');
const errorHandler = require("./src/middlewares/errorHandler"); 
const path = require('path');
const fs = require('fs');
const pdfRoutes = require("./src/routes/pdfRoutes");
const { connectToQueue } = require('./src/config/rmq');
const consumeMailQueue = require('./src/consumers/mailConsumer');
consumeMailQueue(); // ✅ Start the consumer



// Ensure folders exist
['../data', '../uploads'].forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath);
});


// ✅ Automatically create 'data' folder if not present
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Create /files folder if it doesn't exist
const filesDir = path.join(__dirname, 'files');
if (!fs.existsSync(filesDir)) {
  fs.mkdirSync(filesDir);
}

// Initialize express app
const app = express();
//app.use("/pdf", pdfRoutes);


// Setting up your port
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

sequelize.sync({ alter: true })
  .then(() => console.log('Database synced'))
  .catch((err) => console.log('DB Sync error:', err));

 app.use('/api', Routes);

const userRoutes = require('./src/routes/userRoutes'); //  check path is correct
app.use('/users', userRoutes); //  this registers /users route

//  Global error handler middleware (last middleware)
app.use(errorHandler);

const cors = require('cors');
app.use(cors()); //  Add this before your routes

const startServer = async () => {
  await connectToQueue();          
  await consumeMailQueue();        
}

// Start server
app.listen(PORT, () => console.log(`Server is connected on http://localhost:${PORT}`));
console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);

startServer();
