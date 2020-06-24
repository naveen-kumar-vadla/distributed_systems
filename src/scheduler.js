const http = require('http');

const getWorkerOptions = () => {
  return {
    host: 'localhost',
    port: '5000',
    method: 'post',
  };
};

class Scheduler {
  constructor() {
    (this.jobs = []), (this.isWorkerFree = true);
  }
  schedule(job) {
    this.jobs.push(job);
  }
  start() {
    setInterval(() => {
      if (this.isWorkerFree && this.jobs.length) {
        const job = this.jobs.shift();
        console.log('Scheduling jon on worker : ', job.id);
        this.delegateToWorker(job);
      }
    }, 1000);
  }
  delegateToWorker({ id, width, height, tags, count }) {
    const options = getWorkerOptions();
    options.path = `/process/${id}/${count}/${width}/${height}/${tags}`;
    const req = http.request(options, res => {
      console.log('Got from worker', res.statusCode);
    });
    req.end();
    this.isWorkerFree = false;
  }
  setWorkerFree() {
    this.isWorkerFree = true;
  }
}

module.exports = { Scheduler };
