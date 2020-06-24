const http = require('http');

class Scheduler {
  constructor(workerOptions) {
    this.jobs = [];
    this.isWorkerFree = true;
    this.workerOptions = workerOptions;
  }
  schedule(job) {
    this.jobs.push(job);
  }
  start() {
    setInterval(() => {
      if (this.isWorkerFree && this.jobs.length) {
        const job = this.jobs.shift();
        console.log('\nScheduling jon on worker : ', job.id);
        this.delegateToWorker(job);
      }
    }, 1000);
  }
  delegateToWorker(data) {
    const options = this.workerOptions;
    const req = http.request(options, res => {
      console.log('Got from worker', res.statusCode);
    });
    req.write(JSON.stringify(data));
    req.end();
    this.isWorkerFree = false;
  }
  setWorkerFree() {
    this.isWorkerFree = true;
  }
}

module.exports = { Scheduler };
