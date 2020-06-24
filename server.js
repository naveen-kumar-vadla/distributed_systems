const http = require('http');
const express = require('express');
const app = express();
const processImages = require('./processImages').processImages;

let id = 0;
let isWorkerFree = true;
const jobs = []; // { id: id, params: params }
setInterval(() => {
  if (isWorkerFree && jobs.length) {
    const job = jobs.shift();
    console.log('Scheduling jon on worker : ', job.id);
    delegateToWorker(job.id, job.params);
  }
}, 1000);

const getWorkerOptions = () => {
  return {
    host: 'localhost',
    port: '5000',
    method: 'post',
  };
};

const delegateToWorker = (id, { width, height, tags, count }) => {
  const options = getWorkerOptions();
  options.path = `/process/${id}/${count}/${width}/${height}/${tags}`;
  const req = http.request(options, res => {
    console.log('Got from worker', res.statusCode);
  });
  req.end();
  isWorkerFree = false;
};

//log request url and method
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// app.get('/status/:id', (req, res) => {});

app.post('/completed-job/:id', (req, res) => {
  isWorkerFree = true;
  res.end();
});

app.post('/process/:name/:count/:width/:height/:tags', (req, res) => {
  res.send(`id:${id}`);
  res.end();
  jobs.push({ id, params: req.params });
  id++;
});

app.listen(8000, () => console.log('listening on 8000...'));
