const http = require('http');
const redis = require('redis');
const imageSets = require('./imageSets');

const { processImages } = require('./processImages');

const redisClient = redis.createClient({ db: 1 });

const getServerOptions = () => {
  return {
    host: 'localhost',
    port: '8000',
    path: '/request-job',
  };
};

const getJob = () => {
  return new Promise((resolve, reject) => {
    http.get(getServerOptions(), res => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        data = JSON.parse(data);
        if (data.id) resolve(data);
        else reject('no job');
      });
    });
  });
};

const processJobAndRequestAgain = params => {
  console.log('Received :', params);
  imageSets
    .get(redisClient, params.id)
    .then(imageSet => processImages(imageSet))
    .then(tags => {
      imageSets.completedProcessing(redisClient, params.id, tags);
      console.log('Tags :', tags);
    })
    .then(() => console.log('Finished :', params, '\n'))
    .then(main);
};

const main = () => {
  getJob()
    .then(processJobAndRequestAgain)
    .catch(() => setTimeout(main, 1000));
};

main();
