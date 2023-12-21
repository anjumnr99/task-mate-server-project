const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const jwt = require('jsonwebtoken');


const port = process.env.PORT || 5000


// middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Task Mate is running')
})

app.listen(port, () => {
  console.log(`Task Mate listening on port ${port}`)
})