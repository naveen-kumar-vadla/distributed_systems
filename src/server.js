const express = require('express');
const app = express();
const { ImageSets } = require('./ImageSets');
const { Scheduler } = require('./scheduler');

const getWorkerOptions = () => {
  return {
    host: 'localhost',
    port: '5000',
    method: 'post',
    path: '/process',
  };
};

const imageSets = new ImageSets();
const scheduler = new Scheduler(getWorkerOptions());
scheduler.start();

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
    scheduler.setWorkerFree();
    res.end();
  });
});

app.post('/process/:name/:count/:width/:height/:tags', (req, res) => {
  const jobToSchedule = imageSets.addImageSet(req.params);
  res.send(`id:${jobToSchedule.id}`);
  res.end();
  scheduler.schedule(jobToSchedule);
});

app.listen(8000, () => console.log('listening on 8000...'));
