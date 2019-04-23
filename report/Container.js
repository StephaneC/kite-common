// ATM: Useless

const Entity = require('./Entity');

/**
 * Class: Container
 * Extends: Entity
 * Description:
 */
class Container extends Entity {
  constructor(name) {
    super(name);
    this.childrenId = [];
    this.befores = [];
    this.afters = []; 
    this.setStartTimestamp();
  }

  addChild(childId) {
    this.childrenId.push(childId);
  }

  addBeforeStep(stepReport) {
    this.befores.push(stepReport);
  }

  addAfterStep(stepReport) {
    this.afters.push(stepReport);
  }

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
