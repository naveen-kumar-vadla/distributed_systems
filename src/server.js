const redis = require('redis');
const express = require('express');
const imageSets = require('./imageSets');
const http = require('http');

const app = express();
const redisClient = redis.createClient({ db: 1 });

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

const getQueueBrokerOptions = () => ({
  host: 'localhost',
  port: '8001',
  path: '/queue-job/',
  method: 'post',
});

app.post('/process/:name/:count/:width/:height/:tags', (req, res) => {
  imageSets.addImageSet(redisClient, req.params).then(jobToSchedule => {
    res.send(`id:${jobToSchedule.id}`);
    res.end();
    const options = getQueueBrokerOptions();
    options.path = options.path + jobToSchedule.id;
    const qbRequest = http.request(options, res => {
      console.log('Got from Queue Broker ', res.statusCode);
    });
    qbRequest.end();
  });
});

app.listen(8000, () => console.log('listening on 8000...'));
