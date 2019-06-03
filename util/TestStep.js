const {AllureStepReport, KiteTestError, Status} = require('../report');

/**
 * @class TestStep
 * @description Allows to manage the different steps and reports
 * @constructor TestStep()
 */
class TestStep {
  constructor() { 
    this.init();
  }

  /**
   * Returns the step description
   * @abstract function that must be implemented
   * @returns {String} The description
   */
  stepDescription() {
    throw new Error('You must implement this function');
  }

  /**
   * 
   * @param {*} KiteBaseTest 
   */
  async execute(KiteBaseTest) {
    try {
      if(KiteBaseTest.report.status == Status.PASSED) {
        console.log('Executing step: ' + this.stepDescription());
        await this.step(KiteBaseTest);

      } else {
        this.skip();
      }
      await this.finish();
      await KiteBaseTest.report.addStepReport(this.report.getJsonBuilder()); 

    } catch (error) {
      if(error instanceof KiteTestError) {
        console.log(error.message);
        KiteBaseTest.report.status = error.status;
      } else {
        console.log(error);
        KiteBaseTest.report.status = Status.BROKEN;
      }

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