const Entity = require('./Entity');
const Status = require('./Status'); 
const Parameter = require('./Parameter');

/**
 * Class: AllureStepReport
 * Extends: Entity
 * Description:
 */
class AllureStepReport extends Entity {
  constructor(name) {
    super(name);
    this.parameters = [];
    this.attachments = [];
    this.steps = [];
    this.status = Status.PASSED;
    this.ignore = false;
  }

  
  setDescription(description) {
    this.description = description;
  }

  setStatus(status) {
    this.ignore = (status === Status.SKIPPED);
    this.status = status;
    this.setStopTimestamp();
  }

  addStepReport(stepReport) {
    this.steps.push(stepReport);
    this.ignore = stepReport.ignore;
    if (this.status === Status.PASSED && !(stepReport.status === Status.SKIPPED)) {
      this.status = stepReport.status;
    } else {
      if (stepReport.status === Status.PASSED) {
        this.status = stepReport.status;
      }
    }
  }

  addAttachment(attachments) {
    this.attachments.push(attachments);
  }

  addParameter(name, value) { 
    this.parameters.push(new Parameter(name, value));
  }

  setIgnore(ignore) {
    this.ignore = ignore;
  }

  canBeIgnore() {
    return this.ignore;
  }

  setDetail(details) {
    this.details = details;
  }

  getActualStatus() {
    for(let i = 0; i < this.steps.length; i++){
      let temp = this.steps[i].status;
      if (temp === Status.FAILED || temp === Status.BROKEN) {
        return temp;
      }
    }
    return this.status;
  }

  getJsonBuilder() {
    this.status = this.getActualStatus();
    var builder = super.getJsonBuilder();
    builder['description'] = this.description;
    builder['stage'] = this.stage;
    builder['status'] = this.status;
    builder['parameters'] = this.parameters;
    builder['steps'] = this.steps;

    let attArray = [];
    for(let i = 0; i < this.attachments.length; i++) {
      attArray.push(this.attachments[i].getJsonBuilder());
    }
    builder['attachments'] = attArray;

    if (this.details === undefined) {
      builder['statusDetails'] = this.details;
    }

    return builder;
  }
}

module.exports = AllureStepReport;