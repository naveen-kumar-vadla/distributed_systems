const redis = require('redis');
const express = require('express');
const imageSets = require('./imageSets');

const { Scheduler } = require('./scheduler');
const { Agent } = require('./Agent');

const app = express();
const redisClient = redis.createClient({ db: 1 });

const getAgentOptions = port => ({
  host: 'localhost',
  port,
  method: 'post',
  path: '/process',
});

const scheduler = new Scheduler();
scheduler.addAgent(new Agent(1, getAgentOptions(5000)));
scheduler.addAgent(new Agent(2, getAgentOptions(5001)));

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

app.post('/completed-job/:agentId/:id', (req, res) => {
  let data = '';
  req.on('data', chunk => (data += chunk));
  req.on('end', () => {
    const tags = JSON.parse(data);
    console.log('Received from', req.params.agentId, 'Tags', tags);
    imageSets.completedProcessing(redisClient, req.params.id, tags).then(() => {
      scheduler.setWorkerFree(Number(req.params.agentId));
      res.end();
    });
  });
});

app.post('/process/:name/:count/:width/:height/:tags', (req, res) => {
  imageSets.addImageSet(redisClient, req.params).then(jobToSchedule => {
    res.send(`id:${jobToSchedule.id}`);
    res.end();
    scheduler.schedule(jobToSchedule);
  });
});

app.listen(8000, () => console.log('listening on 8000...'));
