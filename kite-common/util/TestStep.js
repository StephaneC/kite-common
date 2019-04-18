const {AllureStepReport, Status} = require('../report');

/**
 * Class: TestStep
 * Description: allows to manage the different steps and reports
 */
class TestStep {
  constructor() { 
    this.init();
  }

  // Abstract function that must be implemented
  // Return (String) the step decription;
  stepDescription() {
    throw new Error('You must implement this function');
  }

  async execute(allureTestReport, reporter) {
    try {
      if(allureTestReport.status == Status.PASSED) {
        console.log('Executing step: ' + this.stepDescription());
        await this.step(allureTestReport, reporter);

      } else {
        this.skip();
      }
      await this.finish();
      await allureTestReport.addStepReport(this.report.getJsonBuilder()); 

    } catch(error) {
      console.log(error);
      allureTestReport.status = Status.BROKEN;
    }
  }

  // Indicates that the step has been skipped
  skip() {
    console.log('Skipping step: ' + this.stepDescription());
    this.report.setStatus(Status.SKIPPED);
  }
  
  // Initializes the description and the step report
  init() {
    let description = this.stepDescription()
    this.report = new AllureStepReport(description);
    this.report.setDescription(description);
  }

  // Updates the end date of the report
  finish() {
    this.report.setStopTimestamp();
  }
  
  // Abstract function that must be implemented
  // Contains all the actions of a step
  async step() {
    throw new Error('You must implement this function');
  }
}

module.exports = TestStep;