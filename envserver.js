require('dotenv').config(); // Load .env variables

//const http = require('http');

// Log to check if they're loaded
//const HOST=process.env.HOST;
//console.log(`app runing on host${HOST}`);

const PORT=process.env.PORT;
console.log(`app runing on port ${PORT}`);

require('dotenv').config();
const express=require('express');
const app=express();

const port=process.env.PORT||5000;
//const host=process.env.HOST;


app.get('/',(req,res)=>{
//const server = http.createServer((req, res) => {
 // res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.send(`Server running at ${process.env.APP_NAME}`);
});


// Query (param )
app.get('/greet', (req, res) => {
  const name = req.query.name || 'Guest';
  res.send(`Hello, ${name}!`);
});

// Route (param )
app.get('/user/:username', (req, res) => {
  const username = req.params.username;
  res.send(`Welcome, ${username}`);
});

// POST (param)

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/data', (req, res) => {
  const { name, email } = req.body;
  res.send(`Received: ${name}, ${email}`);
});

//get (query)

app.get('/search',(req,res)=>{
  const name=req.query.name;
  res.send(`query name is:${name}!`);
});

//post (query)
app.post('/data',(req,res)=>{
  const{name}=req.body;
  res.send(`received:${name}!`);
})


app.listen(port,  () => {
  console.log(` Server is listening at http://localhost:${PORT}`);
});
