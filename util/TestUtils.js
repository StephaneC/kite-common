const fs = require('fs');
const {Builder, By, Key, until, promise} = require('selenium-webdriver');
const statsUtils = require('./statsUtils');
const KiteTestException = require('../report');

const extractStats = function(senderStats, receiverStats) {
  return statsUtils.extractStats(senderStats, receiverStats);
}

const extractJson = function(senderStats, direction) {
  return statsUtils.extractJson(senderStats, direction);
}


const getSumFunctionScript = 'function getSum(total, num) {return total + num;};';

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

const getSDPMessage = async function(driver, peerConnection, type) {
  const sdpObj = await driver.executeScript(sdpMessageScript(peerConnection, type));
  await waitAround(1000);
  return sdpObj;
}

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

const waitForElementsWithTagName = async function(driver, tagName) {
  const videoElements = await driver.findElements(By.tagName(tagName));
  return videoElements.length > 0;
};

const waitForElementsWithId = async function(driver, id) {
  const videoElements = await driver.findElements(By.id(id));
  return videoElements.length > 0;
};

const waitForElementsWithClassName = async function(driver, className) {
  const videoElements = await driver.findElements(By.className(className));
  return videoElements.length > 0;
};


const	waitAround = function (ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const isDocumentReady = async function(driver) {
  const s = await driver.executeScript("return document.readyState");
  return s === "complete";
}

// todo: doc
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
  KiteTestException, 
  waitAround,
  
  // todo: appendToFile function

  writeToFile,

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

  waitForPage: async function(driver, timeout) {
    await driver.wait(isDocumentReady(driver), timeout * 1000);
  },

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

  getStatOnce: async function(driver, statsType, pc) {
    await driver.executeScript(stashStat(statsType, pc));
    await waitAround(100);
    const stat = await driver.executeScript(getStashedStat(statsType));
    return stat;
  },
  
  // todo: doc
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

  // todo: doc
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

  // Todo: doc
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

  takeScreenshot: async function(driver) {
    const image = await driver.takeScreenshot();
    return image;
  },

  open: async function(stepInfo) {
    await stepInfo.driver.get(stepInfo.url);
    await this.waitForPage(stepInfo.driver, stepInfo.timeout); 
  },

  waitVideos: async function(stepInfo, videoElements) {
    let videos = [];
    let i = 0;
    while (videos.length < stepInfo.numberOfParticipant && i < stepInfo.timeout) {
      videos = await stepInfo.driver.findElements(videoElements);
      i++;
      await waitAround(1000); // waiting 1s after each iteration
      }
    return i;
  }
}
