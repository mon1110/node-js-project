const express = require('express');
const app = express();

// Middleware to parse 
app.use(express.json());

// Query param 
app.get('/greet', (req, res) => {
  const name = req.query.name || 'Guest';
  res.send(`Hello, ${name}!`);
});

// Route param 
app.get('/user/:username', (req, res) => {
  const username = req.params.username;
  res.send(`Welcome, ${username}`);
});

// POST param
app.post('/data', (req, res) => {
  const { name, age } = req.body;
  res.send(`Received: ${name}, ${age}`);
});

app.listen(3000, () => {
  console.log('Server is running at http://localhost:3000');
});
