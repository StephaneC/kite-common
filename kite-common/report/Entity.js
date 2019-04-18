const Stage = require('./Stage');
const generateUUID = require('./generate-uuid');

/**
 * Class: Entity
 * Description:
 */
class Entity {
  constructor(name) {
    this.name = name;
    this.stage = Stage.SCHEDULED;
    this.start = Date.now();
    this.uuid = generateUUID();
  }

  setStartTimestamp() {
    this.start = Date.now();
    this.stage = Stage.RUNNING;
  }
  
  setStopTimestamp() {
    this.stop = Date.now();
    this.stage = Stage.FINISHED;
  }

  getUuid() { 
    return this.uuid;
  }

  getName() {
    return this.name 
  }

  
  getJsonBuilder() {
    var builder = {};
    builder['name'] = this.name;
    builder['start'] = this.start;
    builder['stop'] = this.stop;  
    return builder;
  }
  
  toJson() {
    return JSON.stringify(this); 
  }
}

module.exports = Entity;