const firefox = require('selenium-webdriver/firefox');

const getFirefoxOptions = function(browser) {
  let firefoxOptions;
  let path = process.env.KITE_HOME.split("\\").join('/');
  let profile = path + "/third_party/";
  if (profile != undefined) {
    switch(browser.platform) {
      case "Windows": {
        profile += "firefox-h264-profiles/h264-windows";
        break;
      }
      case "Mac": {
        profile += "firefox-h264-profiles/h264-mac";
        break;
      }
      case "Linux": {
        profile += "firefox-h264-profiles/h264-linux";
        break;
      }
    }
    firefoxOptions = new firefox.Options().setProfile(profile);
  } else {
    console.log("FIREFOX: Some tests require specific profile for firefox to work properly.");
    firefoxOptions = new firefox.Options();	
  }
  firefoxOptions.setPreference("media.navigator.streams.fake", true);

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