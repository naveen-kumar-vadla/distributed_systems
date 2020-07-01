const express = require('express');
const app = express();

const jobs = [];

//log request url and method
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.get('/request-job', (req, res) => {
  let job = {};
  if (jobs.length) {
    job = jobs.shift();
  }
  res.write(JSON.stringify(job));
  res.end();
});

app.post('/queue-job/:id', (req, res) => {
  jobs.push({ id: req.params.id });
  res.end();
});

app.listen(8001, () => console.log('QB : listening on 8001...'));
