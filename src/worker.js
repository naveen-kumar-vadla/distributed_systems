const redis = require('redis');
const imageSets = require('./imageSets');

const { processImages } = require('./processImages');

const redisClient = redis.createClient({ db: 1 });

const getJob = () => {
  return new Promise((resolve, reject) => {
    redisClient.brpop('ipQueue', 1, (err, res) => {
      console.log('Got from ipQueue', res);
      if (res) resolve(Number(res[1]));
      else reject('no job');
    });
  });
};

const processJobAndRequestAgain = id => {
  console.log('Received :', id);
  imageSets
    .get(redisClient, id)
    .then(imageSet => processImages(imageSet))
    .then(tags => {
      imageSets.completedProcessing(redisClient, id, tags);
      console.log('Tags :', tags);
    })
    .then(() => console.log('Finished :', id, '\n'))
    .then(main);
};

const main = () => {
  getJob().then(processJobAndRequestAgain).catch(main);
};

main();
