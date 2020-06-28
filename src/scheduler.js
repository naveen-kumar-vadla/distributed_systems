const http = require('http');

class Scheduler {
  constructor(workerOptions) {
    this.jobs = [];
    this.isWorkerFree = true;
    this.workerOptions = workerOptions;
  }
  schedule(job) {
    if (this.isWorkerFree) this.delegateToWorker(job);
    else this.jobs.push(job);
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
    if (this.jobs.length) this.delegateToWorker(this.jobs.shift());
  }
}

module.exports = { Scheduler };
