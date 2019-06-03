const Stage = require('./Stage');
const generateUUID = require('./generate-uuid');

/**
 * Class: Entity
 * Description: Creates an entity
 */
class Entity {
  /**
   * Constructor of the Entity class
   * @param {String} name Entity name
   */
  constructor(name) {
    this.name = name;
    this.stage = Stage.SCHEDULED;
    this.start = Date.now();
    this.uuid = generateUUID();
  }

  /**
   * Sets the start timestamp and sets "stage" to RUNNING
   */
  setStartTimestamp() {
    this.start = Date.now();
    this.stage = Stage.RUNNING;
  }
  
  /**
   * Sets the start timestamp and sets "stage" to FINISHED
   */
  setStopTimestamp() {
    this.stop = Date.now();
    this.stage = Stage.FINISHED;
  }

  /**
   * Gets the uuid
   * @return {String}
   */
  getUuid() { 
    return this.uuid;
  }

  /**
   * Gets the name
   * @return {String}
   */
  getName() {
    return this.name 
  }

  /**
   * Returns the json object corresponding to the entity
   * @return {JSON}
   */
  getJsonBuilder() {
    var builder = {};
    builder['name'] = this.name;
    builder['start'] = this.start;
    builder['stop'] = this.stop;  
    return builder;
  }
  
  /**
   * Returns a string containing the entire contexte
   * @return {String}
   */
  toJson() {
    return JSON.stringify(this); 
  }
}

module.exports = Entity;