const {AllureTestReport, Reporter} = require('../report');
const TestUtils = require('./TestUtils');
const io = require('socket.io-client');

class KiteBaseTest {
  constructor(name, globalVariables, capabilities, payload) {
    // Allure test report
    this.name = name;
    this.numberOfParticipant = globalVariables.numberOfParticipant;
    this.id = globalVariables.id;
    this.uuid = globalVariables.uuid.split('-').join('');
    this.reportPath = globalVariables.reportPath;
    this.capabilities = capabilities;
    
    // default timeout
    this.timeout = 60;

    this.report = new AllureTestReport(this.name);
    this.reporter = new Reporter(this.reportPath);
    
    // fillOutReport();
    if(payload) {
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
    // Todo: Add some info
    this.url = payload.url;
    // Socket server & port
    if (this.numberOfParticipant > 1 && payload.port) {
      this.port = payload.port;
      let server = 'http://localhost:' + this.port + '/';
      this.io = io(server);
    }
    this.timeout = payload.testTimeout;
    this.takeScreenshot = payload.takeScreenshotForEachTest;
    // getStats info
    let getStats = payload.getStats;
    if (getStats) {
      this.getStats = getStats.enabled;
      this.statsCollectionTime = getStats.statsCollectionTime;
      this.statsCollectionInterval = getStats.statsCollectionInterval;
      this.peerConnections = getStats.peerConnections;
      this.selectedStats = getStats.selectedStats;
    }
  }

  setDescription(description) {
    this.report.setDescription(description);
  }

  async run() {
    await this.testScript();
    this.report.setStopTimestamp();
    this.reporter.generateReportFiles();
    let value = this.report.getJsonBuilder();
    TestUtils.writeToFile(this.reportPath + '/result.json', JSON.stringify(value));
  }

  async waitAllSteps() {
    if (this.numberOfParticipant > 1 && this.port) {
      try {
        let waiting = true;
        let i = 0
        while(waiting && i < this.timeout) {
          if(i==0) {
            this.io.emit("test finished", this.id);
          }
          this.io.on("finished", function() {
            waiting = false;
          });
          i++;
          await TestUtils.waitAround(1000); // waiting 1 sec
        }
        this.io.emit("done", this.id);
      } catch (e) {
        console.log(e);
      } finally {
        this.io.close();
      }
    }
  }
}

module.exports = KiteBaseTest;