const http = require('http');

class Scheduler {
  constructor() {
    this.jobs = [];
    this.agents = [];
  }
  addAgent(agent) {
    this.agents.push(agent);
  }
  schedule(job) {
    const agent = this.agents.find(agent => agent.isFree);
    if (agent) this.delegateToAgent(agent, job);
    else this.jobs.push(job);
  }
  delegateToAgent(agent, data) {
    const options = agent.getOptions();
    const req = http.request(options, res => {
      console.log('Got', res.statusCode, 'from worker', agent.agentId);
    });
    req.write(JSON.stringify(data));
    req.end();
    agent.setBusy();
  }
  setWorkerFree(agentId) {
    const agent = this.agents.find(agent => (agent.agentId == agentId));
    agent.isFree = true;
    if (this.jobs.length) this.delegateToAgent(agent, this.jobs.shift());
  }
}

module.exports = { Scheduler };
