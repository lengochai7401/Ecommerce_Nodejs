const express = require('express');
const data = require('./data.js');

const app = express();
// test
app.get('/api/products', (req, res) => {
  res.send(data.products);
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log('server at http://localhost:%d', port);
});
