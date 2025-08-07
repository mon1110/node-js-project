require("dotenv").config();
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  'techrover',
  'postgres',
  'root',
  {
    dialect: "postgres",
    host: process.env.PG_HOST,
  }
);

sequelize.sync().then(() => {
  console.log(`Database connected to discover`);
}).catch((err) => {
  console.error('Database connection error:', err);
});

jest.mock('../config/db.config', () => ({
  getAuthConfig: jest.fn().mockResolvedValue({
    maxAttempts: 4,
    blockDurationMs: 30000,
  }),
}));


module.exports = sequelize;
