const chrome = require('selenium-webdriver/chrome');
const firefox = require('selenium-webdriver/firefox');

module.exports = {
	getOptions: function(browser) {
		switch(browser) {
		  case 'chrome': {
		    const chromeOptions = new chrome.Options();
        chromeOptions.addArguments("use-fake-ui-for-media-stream");
        chromeOptions.addArguments("use-fake-device-for-media-stream");
        // todo : more flags options here
        return chromeOptions;
	    }
		  default:
		    //todo
		    return null;
		}
	}
}