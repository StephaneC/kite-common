const CustomAttachment = require('./CustomAttachment');
const {TestUtils} = require('kite-common');


/**
 * Class: Reporter
 * Description:
 */
class Reporter {
  constructor(reportPath) {
    this.reportPath = reportPath;
    this.containers = [];
    this.tests = [];
    this.attachments = [];
  }

  jsonAttachment(stepReport, name, jsonObject) {
    let value = JSON.stringify(jsonObject);
    let attachment = new CustomAttachment(name, "text/json", "json");
    attachment.setText(value);
    this.addAttachment(stepReport, attachment);
  }

  textAttachment(stepReport, name, value, type) {
    let attachment = new CustomAttachment(name, "text/" + type, type);
    attachment.setText(value);
    this.addAttachment(stepReport, attachment);
  }

  // TODO
  // saveAttachmentToSubFolder() {}

  screenshotAttachment(stepReport, name, screenshot) {
    let attachment = new CustomAttachment(name, "image/png", "png");
    attachment.setScreenshot(screenshot);
    this.addAttachment(stepReport, attachment);
  }

  addAttachment(stepReport, attachment) {
    this.attachments.push(attachment);
    stepReport.addAttachment(attachment);
  }

  addContainer(container) {
    this.containers.push(container);
  }

  addTest(test) {
    this.tests.push(test);
  }

  updateContainers() {
    for(let i = 0; i < this.containers.length; i++) {

      let fileName = this.reportPath + '/' + this.containers[i].getUuid() + "-container.json";
      TestUtils.writeToFile(fileName, this.containers[i].text);
    }
  }

  generateReportFiles() {
    this.updateContainers(this.reportPath);

    
    for(let i = 0; i < this.tests.length; i++) {
      let fileName = this.reportPath + '/' + this.tests[i].getUuid() + "-result.json";
      TestUtils.writeToFile(fileName, this.tests[i].text);
    }

    for(let i = 0; i < this.attachments.length; i++) {
      this.attachments[i].saveToFile(this.reportPath);
    }
  }
}




module.exports = Reporter;