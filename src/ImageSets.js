class ImageSets {
  constructor() {
    this.imageSets = {};
    this.id = 0;
  }
  addImageSet(imageSet) {
    let jobToSchedule = Object.assign({ id: this.id }, imageSet);
    this.imageSets[this.id] = Object.assign({}, imageSet);
    this.imageSets[this.id].status = 'Scheduled';
    this.imageSets[this.id].receivedAt = new Date();
    this.id++;
    return jobToSchedule;
  }
  completedProcessing(id, tags) {
    this.imageSets[id].tags = tags;
    this.imageSets[id].status = 'completed';
  }
  get(id) {
    return Object.assign({}, this.imageSets[id]);
  }
}
module.exports = { ImageSets };
