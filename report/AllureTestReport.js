const AllureStepReport = require('./AllureStepReport');
const Parameter = require('./Parameter');
const generateUUID = require('./generate-uuid');

/**
 * Class: AllureTestReport
 * Extends: AllureStepReport
 * Description:
 */
class AllureTestReport extends AllureStepReport {
  constructor(name, uuid) {
    super(name);
    this.labels = [];
    this.links = [];
    this.uuid = uuid;
    this.historyId = generateUUID();
  }

  extract(otherReport) {
    this.labels = otherReport.labels;
    this.links = [];
    this.uuid = otherReport.uuid;
    this.historyId = generateUUID();
  }

  setFullName(fullName) {
    this.fullName = fullName;
  }

  addLabel(name, value) {
    this.labels.push(new Parameter(name, value));
  }

  addLink(link) {
    this.links.push(link);
  }

  getJsonBuilder() {
    let temp = super.getJsonBuilder();
    let builder = {};
    builder['status'] = temp['status'];
    builder['steps'] = temp['steps'];
    return builder;
  }
}

module.exports = AllureTestReport;