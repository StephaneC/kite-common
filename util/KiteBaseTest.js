const {AllureTestReport, Reporter} = require('../report');

class KiteBaseTest {
  constructor(name, globalVariables, capabilities, payload) {
    // Allure test report
    this.name = name;
    this.numberOfParticipant = globalVariables.numberOfParticipant;
    this.id = globalVariables.id;
    this.reportPath = globalVariables.reportPath;
    this.capabilities = capabilities;
    
    // default timeout
    this.timeout = 60 * 1000;

    this.report = new AllureTestReport(this.name);
    this.reporter = new Reporter(this.reportPath);
    
    // fillOutReport();
    if(payload != undefined) {
      this.payload = payload;
      this.payloadHandling(this.payload);
    }
  }

  setTestReport(report) {
    this.report = report;
  }
  
  async testScript() {
    throw new Error('You must implement this function');
  }

  payloadHandling(payload) {
    if (payload != undefined) {
      // Todo: Add some info
      this.url = payload.url;
      this.timeout = payload.testTimeout * 1000;
      this.statsCollectionTime = payload.statsCollectionTime * 1000;
      this.statsCollectionInterval = payload.statsCollectionInterval * 1000;
      this.selectedStats = payload.selectedStats;
    }
  }

  setDescription(description) {
    this.report.setDescription(description);
  }
}

module.exports = KiteBaseTest;