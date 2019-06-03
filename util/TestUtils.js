const fs = require('fs');
const {Builder, By, Key, until, promise} = require('selenium-webdriver');
const statsUtils = require('./statsUtils');
const {KiteTestError, Status} = require('../report');

const extractStats = function(senderStats, receiverStats) {
  return statsUtils.extractStats(senderStats, receiverStats);
}

const extractJson = function(senderStats, direction) {
  return statsUtils.extractJson(senderStats, direction);
}


const getSumFunctionScript = 'function getSum(total, num) {return total + num;};';

/**
 * Gets the script to get the sum of the pixels of a video with its id
 * @param {Number} id Video id
 * @return {String} The script to get the sum of the pixels of a video
 */
const getPixelSumsByIdScript = function(id) {
  return getSumFunctionScript + 'const canvas = document.createElement(\'canvas\');' 
  + "const id = document.getElementById('" + id + "');"
  + 'const ctx = canvas.getContext(\'2d\');' 
  + 'ctx.drawImage(id, 0, 0, id.videoHeight-1, id.videoWidth-1);' 
  + 'const imageData = ctx.getImageData(0, 0, id.videoHeight-1, id.videoWidth-1).data;' 
  + 'const sum = imageData.reduce(getSum);' 
  + 'if (sum===255*(Math.pow(id.videoHeight-1,(id.videoWidth-1)*(id.videoWidth-1)))) {'
  + '   return 0;' 
  + '}' 
  + 'return sum;';
}

/**
 * Gest the script to get the sum of the pixels of a video with its index
 * @param {Number} index Video index
 * @return {String} The script to get the sum of the pixels of a video
 */
const getPixelSumByIndexScript = function(index) {
  return "function getSum(total, num) {    return total + num;};"
  + "var canvas = document.createElement('canvas');"
  + "var ctx = canvas.getContext('2d');"
  + "var videos = document.getElementsByTagName('video');"
  + "var video = videos[" + index + "];"
  + "if(video){ctx.drawImage(video,0,0,video.videoHeight-1,video.videoWidth-1);"
  + "var imageData = ctx.getImageData(0,0,video.videoHeight-1,video.videoWidth-1).data;var sum = imageData.reduce(getSum);"
  + "if (sum===255*(Math.pow(video.videoHeight-1,(video.videoWidth-1)*(video.videoWidth-1))))   return 0;"
  + "return sum;} else {return 0 }";
}

/**
 * Gets the script to get the statistics 
 * @param {statsType} statsType Type of statistics
 * @return {String} The script to get the statistics
 */
const getStashedStat = function(statsType) {
  let jsQuery = "";
  switch (statsType) {
    case "kite":
      jsQuery = "return window.KITEStats;";
      break;
    case "local":
      jsQuery = "return window.LocalStats;";
      break;
    case "remote":
      jsQuery = "return window.RemoteStats;";
      break;
    case "jitsi":
      jsQuery = "return window.JitsiStats;";
      break;
    case 'mediasoup':
      jsQuery = "return window.MediasoupStats";

  }
  return jsQuery;
}

/**
 * Gets the script for getStats() according to the type of statistics
 * @param {String} statsType Type of statistics
 * @param {String} pc The peer connection 
 * @return {String} The script to get the statistics
 */
const stashStat = function(statsType, pc) {
  let jsQuery = "";
  switch (statsType) {
    case "kite":
      jsQuery = "const getStatsValues = (pc) =>"
        + "    pc.getStats()"
        + "    .then(data => {"
        + "      return [...data.values()];"
        + "    });"
        + "const stashStats = async () => {"
        + "  window.KITEStats = await getStatsValues(" + pc + ");"
        + "  return window.KITEStats;"
        + "};"
        + "stashStats();";
      break;
    case "local":
      jsQuery = "const getLocalStatsValues = (pc) =>"
        + "  pc.getStats(function (res) {"
        + "            var items = [];"
        + "            res.result().forEach(function (result) {"
        + "                var item = {};"
        + "                result.names().forEach(function (name) {"
        + "                    item[name] = result.stat(name);"
        + "                });"
        + "                item.id = result.id;"
        + "                item.type = result.type;"
        + "                item.timestamp = result.timestamp.getTime().toString();"
        + "                items.push(item);"
        + "            });"
        + "            window.LocalStats = items;"
        + "        });"
        + "const stashLocalStats = async () => {"
        + "  await getLocalStatsValues(" + pc + ");"
        + "  return window.LocalStats;"
        + "};"
        + "stashLocalStats();";
      break;
    case "remote":
      jsQuery = "const getRemoteStatsValues = (i) =>"
        + "  remotePc[i].getStats(function (res) {"
        + "            var items = [];"
        + "            res.result().forEach(function (result) {"
        + "                var item = {};"
        + "                result.names().forEach(function (name) {"
        + "                    item[name] = result.stat(name);"
        + "                });"
        + "                item.id = result.id;"
        + "                item.type = result.type;"
        + "                item.timestamp = result.timestamp.getTime().toString();"
        + "                items.push(item);"
        + "            });"
        + "            if (!window.RemoteStats) window.RemoteStats = [items]; "
        + "            else window.RemoteStats.push(items);"
        + "        });"
        + "const stashRemoteStats = async () => {"
        + "  window.RemoteStats = [];"
        + "  for (i in remotePc) await getRemoteStatsValues(i);"
        + "  return window.RemoteStats;"
        + "};"
        + "stashRemoteStats();";
      break;
    case "jitsi":
      jsQuery = "const getJitsiStatsValues = (pc) =>"
        + "  pc.getStats(function (res) {"
        + "            var items = [];"
        + "            res.result().forEach(function (result) {"
        + "                var item = {};"
        + "                result.names().forEach(function (name) {"
        + "                    item[name] = result.stat(name);"
        + "                });"
        + "                item.id = result.id;"
        + "                item.type = result.type;"
        + "                item.timestamp = result.timestamp.getTime().toString();"
        + "                items.push(item);"
        + "            });"
        + "            if (!window.JitsiStats) window.JitsiStats = [items]; "
        + "            else window.JitsiStats.push(items);"
        + "        });"
        + "const stashJitsiStats = async () => {"
        + "  window.JitsiStats = [];"
        + "  await getJitsiStatsValues(" + pc +");"
        + "  return window.JitsiStats;"
        + "};"
        + "stashJitsiStats();";
      break;
      case "mediasoup":
        jsQuery = "const getMediasoupStatsValues = (pc) =>"
        + "  pc.getStats(function (res) {"
        + "            var items = [];"
        + "            res.result().forEach(function (result) {"
        + "                var item = {};"
        + "                result.names().forEach(function (name) {"
        + "                    item[name] = result.stat(name);"
        + "                });"
        + "                item.id = result.id;"
        + "                item.type = result.type;"
        + "                item.timestamp = result.timestamp.getTime().toString();"
        + "                items.push(item);"
        + "            });"
        + "            if (!window.MediasoupStats) window.MediasoupStats = [items]; "
        + "            else window.MediasoupStats.push(items);"
        + "        });"
        + "const stashMediasoupStats = async () => {"
        + "  window.MediasoupStats = [];"
        + "  await getMediasoupStatsValues(" + pc +");"
        + "  return window.MediasoupStats;"
        + "};"
        + "getMediasoupStatsValues();";
      break;
  }
  return jsQuery;
}

/**
 * Gets the sdp message
 * @param {Object} driver 
 * @param {String} peerConnection The peer connection 
 * @param {String} type Type of sdp message
 * @return {Object} The sdp object
 */
const getSDPMessage = async function(driver, peerConnection, type) {
  const sdpObj = await driver.executeScript(sdpMessageScript(peerConnection, type));
  await waitAround(1000);
  return sdpObj;
}

/**
 * Returns the script corresponding to the message type
 * @param {String} peerConnection The peer connection 
 * @param {String} type Type of sdp message
 * @return {String} The sdp message script
 */
const sdpMessageScript = function(peerConnection, type) {
  switch (type) {
    case 'offer':
      return "var SDP;"
      + "try {SDP = " + peerConnection + ".remoteDescription;} catch (exception) {} "
      + "if (SDP) {return SDP;} else {return 'unknown';}";
    case "answer":
      return "var SDP;"
      + "try {SDP = " + peerConnection + ".localDescription;} catch (exception) {} "
      + "if (SDP) {return SDP;} else {return 'unknown';}";
    default: 
      throw new Error("Not a valid type for sdp message.");
  }
}

/**
 * Waits for elements with a tag name
 * @param {Object} driver 
 * @param {String} tagName Tag name of the elements to be waited for
 */
const waitForElementsWithTagName = async function(driver, tagName) {
  const videoElements = await driver.findElements(By.tagName(tagName));
  return videoElements.length > 0;
};

/**
 * Waits for elements with an id
 * @param {Object} driver 
 * @param {Number} id Id of the elements to be waited for
 */
const waitForElementsWithId = async function(driver, id) {
  const videoElements = await driver.findElements(By.id(id));
  return videoElements.length > 0;
};

/**
 * Waits for elements with a class name
 * @param {Object} driver 
 * @param {String} className Class name of the elements to be waited for
 * @return {Boolean}  
 */
const waitForElementsWithClassName = async function(driver, className) {
  const videoElements = await driver.findElements(By.className(className));
  return videoElements.length > 0;
};

/**
 * Waits a while
 * @param {Number} ms Time in ms
 * @return {Promise} Returns a resolved promise after a given time
 */
const	waitAround = function (ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Checks if the state the document is "complete"
 * @param {Object} driver 
 * @return {Boolean} 
 */
const isDocumentReady = async function(driver) {
  const s = await driver.executeScript("return document.readyState");
  return s === "complete";
}

// todo: doc
/**
 * Writes the desired content in a file
 * @param {String} fileName The file in which to write
 * @param {String} content The content to write
 */
const writeToFile = function (fileName, content) {
  let writeStream = fs.createWriteStream(fileName);

  writeStream.write(content);

  // the finish event is emitted when all data has been flushed from the stream
  writeStream.on('finish', () => {
      console.log('wrote all data to file');
  });

  // close the stream
  writeStream.end();
}

module.exports = {
  KiteTestError, 
  waitAround,
  
  // todo: appendToFile function

  writeToFile,

  /**
   * Retrieves arguments and information useful for tests
   * @param {Object} process Provides information about the current Node.js process
   * @return {Object} A collection of named values containing information for testing
   */
  getGlobalVariables: function(process){
    const numberOfParticipant = process.argv[2];
    const id = process.argv[3]; // To identify browsers
    const uuid = process.argv[4];
    let reportPath = process.argv[5];
    
    const payloadPath = reportPath + '/payload.json';
    reportPath = reportPath + '/' + id;
    const capabilitiesPath = reportPath + '/capabilities.json';
    const resultFilePath = reportPath + '/' + uuid + '-result.json';
    const screenshotFolderPath = reportPath + '/screenshots';
    let variables = {
      numberOfParticipant: numberOfParticipant,
      id: id,
      uuid: uuid,
      capabilitiesPath: capabilitiesPath,
      payloadPath: payloadPath,
      reportPath: reportPath,	
      resultFilePath: resultFilePath,
      screenshotFolderPath: screenshotFolderPath
    }
    return variables; 
  },

  /**
   * Waits for page to be ready 
   * @param {WebDriver} driver 
   * @param {Number} timeout Time in s before it timeout 
   */
  waitForPage: async function(driver, timeout) {
    await driver.wait(isDocumentReady(driver), timeout * 1000);
  },

  /**
   * Waits for element in the current page
   * @param {Object} driver 
   * @param {String} type The type of element 
   * @param {String} value The element value
   * @param {Number} timeout Time in s before it timeout  
   */
  waitForElement: async function(driver, type, value, timeout) {
    switch(type) {
      case 'id': {
        return driver.wait(waitForElementsWithId(driver, value), timeout * 1000);
      }
      case 'className': {
        return driver.wait(waitForElementsWithClassName(driver, value), timeout * 1000);
      }
      case 'tagName': {
        return driver.wait(waitForElementsWithTagName(driver, value), timeout * 1000);
      }
      default:
        throw new Error('Unsupported wait type: ' + type);
    }
  },

  /**
   * Gets the statistics once
   * @param {Object} driver 
   * @param {String} statsType Type of statistics
   * @param {String} pc The peer connection 
   * @return An array of statistics
   */
  getStatOnce: async function(driver, statsType, pc) {
    await driver.executeScript(stashStat(statsType, pc));
    await waitAround(100);
    const stat = await driver.executeScript(getStashedStat(statsType));
    return stat;
  },
  
  /**
   * Gets the statistics several times
   * @param {Object} stepInfo Reference to the Step object
   * @param {String} statsType Type of statistics
   * @param {String} pc The peer connection
   * @return A collection of named values 
   */
  getStats: async function(stepInfo, statsType, pc) {
    let stats = {};
    for (let i = 0; i < stepInfo.statsCollectionTime; i += stepInfo.statsCollectionInterval) {
      let stat = await this.getStatOnce(stepInfo.driver, statsType, pc);
      if (i == 0) {
        stats['stats'] = [];
        let offer = await getSDPMessage(stepInfo.driver, pc, "offer");
        let answer = await getSDPMessage(stepInfo.driver, pc, "answer");
        stats['offer'] = offer;
        stats['answer'] = answer;
      }
      stats['stats'].push(stat);
      await waitAround(stepInfo.statsCollectionInterval * 1000);
    }
    return statsUtils.buildClientStatObject(stats, stepInfo.selectedStats);
  },

  extractStats,
  extractJson,

  /**
   * Checks the video with an given index
   * @param {Object} driver 
   * @param {Number} index Video index to be checked
   * @return A collection of named values
   */
  verifyVideoDisplayByIndex: async function(driver, index) {
    const sumArray = [];
    let result = {};
    let videoCheck = 'video';
    const sum1 = await driver.executeScript(getPixelSumByIndexScript(index));
    sumArray.push(sum1);
    await waitAround(1000);
    const sum2 = await driver.executeScript(getPixelSumByIndexScript(index));
    sumArray.push(sum2);

    if (sumArray.length == 0 || sumArray.includes(0)) {
      videoCheck = 'blank';
      //throw new Error('The video was blank at the moment of checking');
    } else {
      if (Math.abs(sumArray[0] - sumArray[1]) == 0) {
          videoCheck = 'still';
          //throw new Error('The video was still at the moment of checking');
      }
      console.log('Verified video display for video[' + index + '] successfully with ' + sumArray[0] + ' and ' + sumArray[1]);
      result['result'] = videoCheck;
      result['details'] = sumArray;
    }
    return result;
  },

    /**
   * Checks the video with an given id
   * @param {Object} driver 
   * @param {Number} id Video id to be checked
   * @return A collection of named values
   */
  verifyVideoDisplayById: async function(driver, id) {
    const sumArray = [];
    let result = {};
    let videoCheck = 'video';
    const sum1 = await driver.executeScript(getPixelSumsByIdScript(id));
    sumArray.push(sum1);
    await waitAround(1000);
    const sum2 = await driver.executeScript(getPixelSumsByIdScript(id));
    sumArray.push(sum2);

    if (sumArray.length == 0 || sumArray.includes(0)) {
      videoCheck = 'blank';
      //throw new Error('The video was blank at the moment of checking');
    } else {
      if (Math.abs(sumArray[0] - sumArray[1]) == 0) {
          videoCheck = 'still';
          //throw new Error('The video was still at the moment of checking');
      }
      console.log('Verified video display for [' + id + '] successfully with ' + sumArray[0] + ' and ' + sumArray[1]);
      result['result'] = videoCheck;
      result['details'] = sumArray;
    }
    return result;
  },

  /**
   * Takes a screenshot of the current page and return it
   * @param {WebDriver} driver
   * @return {Object} A base-64 encoded PNG 
   */
  takeScreenshot: async function(driver) {
    const image = await driver.takeScreenshot();
    return image;
  },

  /**
   * Navigates to the url and wait for the page to be ready
   * @param {Object} stepInfo Reference to the Step object
   */
  open: async function(stepInfo) {
    await stepInfo.driver.get(stepInfo.url);
    await this.waitForPage(stepInfo.driver, stepInfo.timeout); 
  },

  /**
   * Waits for the video elements of the page 
   * @param {Object} stepInfo Reference to the Step object
   * @param {String} videoElements 
   */
  waitVideos: async function(stepInfo, videoElements) {
    let videos = [];
    let i = 0;
    while (videos.length < stepInfo.numberOfParticipant && i < stepInfo.timeout) {
      videos = await stepInfo.driver.findElements(videoElements);
      i++;
      await waitAround(1000); // waiting 1s after each iteration
      }
    // Make sure that it has not timed out
    if (i === stepInfo.timeout) {
      throw new KiteTestError(Status.FAILED, "unable to find " +
        stepInfo.numberOfParticipant + " <video> element on the page. Number of video found = " +
        videos.length);
    }
  }
}
