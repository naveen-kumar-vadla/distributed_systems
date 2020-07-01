class Agent {
  constructor(id, options) {
    this.agentId = id;
    this.options = options;
    this.isFree = true;
  }
  getOptions() {
    return Object.assign({}, this.options);
  }
  setBusy() {
    this.isFree = false;
  }
}

module.exports = { Agent };
