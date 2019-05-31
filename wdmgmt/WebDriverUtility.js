const firefox = require('selenium-webdriver/firefox');

const getFirefoxOptions = function(browser) {
  let firefoxOptions;
  let kiteHome = process.env.KITE_HOME;
  if (kiteHome != undefined) {
    let path = kiteHome.split("\\").join('/');
    let profile = path + "/third_party/";
    switch(browser.platform.toUpperCase()) {
      case "WINDOWS": {
        profile += "firefox-h264-profiles/h264-windows";
        break;
      }
      case "MAC": {
        profile += "firefox-h264-profiles/h264-mac";
        break;
      }
      case "LINUX": {
        profile += "firefox-h264-profiles/h264-linux";
        break;
      }
    }
    firefoxOptions = new firefox.Options().setProfile(profile);
    firefoxOptions.setPreference("media.navigator.streams.fake", true);
  } else {
    throw new Error("KITE_HOME is not defined");
  }
  return firefoxOptions;
}

module.exports = {
  getOptions: function(browser) {
    switch(browser.browserName) {
      case 'chrome': {
        const chromeOptions = {
          'args': ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream']
        };
        return chromeOptions;	
      }
      case 'firefox': {
        return getFirefoxOptions(browser);
      }
      default:
        //todo
        return null;
    }
  }
}