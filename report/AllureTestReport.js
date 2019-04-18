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
    var builder = super.getJsonBuilder();
    builder['uuid'] = this.uuid;
    builder['fullName'] = this.fullName;
    builder['historyId'] = this.historyId;
    builder['links'] = this.links;
    builder['labels'] = this.labels;
    return builder;
  }
}

module.exports = AllureTestReport;