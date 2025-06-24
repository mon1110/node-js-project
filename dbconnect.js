require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const pool = new Pool({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE
});

// POST: Add user
app.post('/users', async (req, res) => {
  const { name } = req.body;
  try {
    await pool.query('INSERT INTO users (name) VALUES ($1)', [name]);
    res.send(`User added: ${name}`);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// GET: List users
app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});



