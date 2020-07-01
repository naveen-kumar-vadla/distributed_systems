const redis = require('redis');
const express = require('express');
const imageSets = require('./imageSets');

const app = express();
const redisClient = redis.createClient({ db: 1 });

const jobs = [];

//log request url and method
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.get('/status/:id', (req, res) => {
  imageSets.get(redisClient, req.params.id).then(imageSet => {
    res.write(JSON.stringify(imageSet));
    res.end();
  });
});

app.get('/request-job', (req, res) => {
  let job = {};
  if (jobs.length) {
    job = jobs.shift();
  }
  res.write(JSON.stringify(job));
  res.end();
});

app.post('/process/:name/:count/:width/:height/:tags', (req, res) => {
  imageSets.addImageSet(redisClient, req.params).then(jobToSchedule => {
    res.send(`id:${jobToSchedule.id}`);
    res.end();
    jobs.push(jobToSchedule);
  });
});

app.listen(8000, () => console.log('listening on 8000...'));
