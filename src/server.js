const http = require('http');
const express = require('express');
const app = express();
const { ImageSets } = require('./ImageSets');

let isWorkerFree = true;
const jobs = []; // { id: id, params: params }
const imageSets = new ImageSets();

setInterval(() => {
  if (isWorkerFree && jobs.length) {
    const job = jobs.shift();
    console.log('Scheduling jon on worker : ', job.id);
    delegateToWorker(job);
  }
}, 1000);

const getWorkerOptions = () => {
  return {
    host: 'localhost',
    port: '5000',
    method: 'post',
  };
};

const delegateToWorker = ({ id, width, height, tags, count }) => {
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

app.get('/status/:id', (req, res) => {
  const imageSet = imageSets.get(req.params.id);
  res.write(JSON.stringify(imageSet));
  res.end();
});

app.post('/completed-job/:id', (req, res) => {
  let data = '';
  req.on('data', chunk => (data += chunk));
  req.on('end', () => {
    const tags = JSON.parse(data);
    console.log('Received Tags', tags);
    imageSets.completedProcessing(req.params.id, tags);
    isWorkerFree = true;
    res.end();
  });
});

app.post('/process/:name/:count/:width/:height/:tags', (req, res) => {
  const jobToSchedule = imageSets.addImageSet(req.params);
  res.send(`id:${jobToSchedule.id}`);
  res.end();
  console.log('Job is', jobToSchedule);
  jobs.push(jobToSchedule);
});

app.listen(8000, () => console.log('listening on 8000...'));
