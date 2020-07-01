const http = require('http');
const express = require('express');
const redis = require('redis');
const imageSets = require('./imageSets');

const { processImages } = require('./processImages');

const app = express();
const redisClient = redis.createClient({ db: 1 });

let agentId;

const getServerOptions = () => {
  return {
    host: 'localhost',
    port: '8000',
    method: 'post',
  };
};

const informWorkerFree = () => {
  const options = getServerOptions();
  options.path = `/completed-job/${agentId}`;
  const req = http.request(options, () => {});
  req.end();
};

//log request url and method
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.post('/process', (req, res) => {
  let data = '';
  req.on('data', chunk => (data += chunk));
  req.on('end', () => {
    const params = JSON.parse(data);
    imageSets
      .get(redisClient, params.id)
      .then(imageSet => processImages(imageSet))
      .then(tags => {
        imageSets.completedProcessing(redisClient, params.id, tags);
        console.log(tags);
      })
      .then(informWorkerFree);
  });
  res.end();
});

const main = (port, id) => {
  const PORT = port || 5000;
  agentId = Number(id);
  app.listen(PORT, () => console.log(`listening on ${PORT}...`));
};

main(...process.argv.slice(2));
