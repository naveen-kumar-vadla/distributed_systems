const express = require('express');
const app = express();
const processImages = require('./processImages').processImages;

//log request url and method
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.post('/process/:name/:count/:width/:height/:tags', (req, res) => {
  processImages(req.params)
    .then(tags => {
      console.log(tags);
      return tags;
    })
    .then(tags => {
      res.write(JSON.stringify(tags));
      res.end();
    });
});

app.listen(8000, () => console.log('listening on 8000...'));
