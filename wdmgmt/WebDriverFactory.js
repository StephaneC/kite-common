const WebDriverUtils = require('./WebDriverUtility.js');

const {Builder, By, Key, until, promise} = require('selenium-webdriver');
module.exports = {
	getDriver: async function(capabilities, remoteAddress) {
		//to make sure the cap doesn't has anything weird:
		const cap = {};
		cap.browserName = capabilities.browserName;
		cap.version = capabilities.version;
		cap.platformName = capabilities.platformName;
		cap.platform = capabilities.platform;
		const browserName = cap.browserName;
		const options = WebDriverUtils.getOptions(browserName)
		switch (browserName) {
			case 'chrome': {
				return new Builder().forBrowser(browserName)
          .setChromeOptions(options)
          .usingServer(remoteAddress)
          .withCapabilities(cap)
          .build();
			}
			default:
				throw new Error('Unsupported browser type: ' + browserName);
		}

	}
}
