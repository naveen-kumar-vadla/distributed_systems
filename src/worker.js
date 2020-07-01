const http = require('http');
const express = require('express');
const app = express();
const processImages = require('./processImages').processImages;

let agentId;

const getServerOptions = () => {
  return {
    host: 'localhost',
    port: '8000',
    method: 'post',
  };
};

const informWorkerFree = ({ id, tags }) => {
  const options = getServerOptions();
  options.path = `/completed-job/${agentId}/${id}`;
  const req = http.request(options, () => {});
  req.write(JSON.stringify(tags));
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
    processImages(params)
      .then(tags => {
        console.log(tags);
        return { id: params.id, tags };
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
