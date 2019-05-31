const WebDriverUtils = require('./WebDriverUtility.js');
const {Builder} = require('selenium-webdriver');

const getSystemPlatform = function() {
  let platform = process.platform;
  if (platform.includes('win')) {
    return 'Windows';
  }
  if (platform.includes('mac') || platform.includes('darwin')) {
    return 'Mac';
  }
  if (platform.includes('nux')) {
    return 'Linux';
  }
  return platform;
}

module.exports = {
  getDriver: async function(capabilities, remoteAddress) {
    //to make sure the cap doesn't has anything weird:
    const cap = {};
    cap.browserName = capabilities.browserName;
    cap.version = capabilities.version;

    if (capabilities.platformName === 'localhost') {
      let systemName = getSystemPlatform();
      cap.platformName = systemName;
      cap.platform = systemName;
    } else {
      cap.platformName = capabilities.platformName;
      cap.platform = capabilities.platform;
    }

    const options =  WebDriverUtils.getOptions(cap);
    switch (cap.browserName) {
      case 'chrome': {
        cap['goog:chromeOptions'] =  options;
        return new Builder()
          .forBrowser('chrome')
          .usingServer(remoteAddress)
          .withCapabilities(cap)
          .build();
      }
      case 'firefox': {
        cap.acceptInsecureCerts = true;
        return new Builder()
          .forBrowser('firefox')
          .usingServer(remoteAddress)
          .withCapabilities(cap)
          .setFirefoxOptions(options)
          .build();
      }
      default:
        throw new Error('Unsupported browser type: ' + browserName);
    }
  }
}
