// ATM: Useless

const Entity = require('./Entity');

/**
 * Class: Container
 * Extends: Entity
 * Description: Create a container
 */
class Container extends Entity {
  /** 
   * Constructor of the Container class
   * @param {String} name Container name
   */
  constructor(name) {
    super(name);
    this.childrenId = [];
    this.befores = [];
    this.afters = []; 
    this.setStartTimestamp();
  }

  /**
   * Adds a child
   * @param {Number} childId Child id
   */
  addChild(childId) {
    this.childrenId.push(childId);
  }

  /**
   * Adds a step before
   * @param {Object} stepReport Report to add before
   */
  addBeforeStep(stepReport) {
    this.befores.push(stepReport);
  }

  /**
   * Adds a step after
   * @param {Object} stepReport Report to add after
   */
  addAfterStep(stepReport) {
    this.afters.push(stepReport);
  }

  /**
   * Returns the json object corresponding to the container
   * @return {JSON}
   */
  getJsonBuilder() {
    let builder = super.getJsonBuilder();
    builder['start'] = this.start;
    builder['stop'] = this.stop;
    builder['uuid'] = this.uuid;
    builder['children'] = this.childrenId;
    builder['befores'] = this.befores;
    builder['afters'] = this.afters;
    return builder;
  }
}


module.exports = Container;
