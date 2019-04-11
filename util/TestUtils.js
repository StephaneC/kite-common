const fs = require('fs');
const {Builder, By, Key, until, promise} = require('selenium-webdriver');

const getSumFunctionScript = 'function getSum(total, num) {return total + num;};';

const getPixelSumsByIdScript = function(id) {
	return getSumFunctionScript + 'const canvas = document.createElement(\'canvas\');' 
	+ '' 
	+ 'const ctx = canvas.getContext(\'2d\');' 
	+ 'ctx.drawImage(' + id + ',0,0,' + id + '.videoHeight-1,' + id + '.videoWidth-1);' 
	+ 'const imageData = ctx.getImageData(0,0,' + id + '.videoHeight-1,' + id + '.videoWidth-1).data;' 
	+ 'const sum = imageData.reduce(getSum);' 
	+ 'if (sum===255*(Math.pow(' + id + '.videoHeight-1,(' + id + '.videoWidth-1)*(' + id + '.videoWidth-1)))) {'
	+ '   return 0;' 
	+ '}' 
	+ 'return sum;';
}

const getStatOnce = async function(driver, pc) {
	await driver.executeScript(stashStat(pc));
	await waitAround(100);
	const stat = await driver.executeScript(getStashedStat);
	return stat;
}

const stashStat = function(pc) {
	return pc + '.getStats().then(data => {' +
	'window.KITEStats = [...data.values()];' +
	'});'
}

const getStashedStat = 'return window.KITEStats;';

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

const	searchCache = function (moduleName, callback) {
  var mod = require.resolve(moduleName);

  if (mod && ((mod = require.cache[mod]) !== undefined)) {
    (function traverse(mod) {
      mod.children.forEach(function (child) {
        traverse(child);
      });
      callback(mod);
    }(mod));
  }
}

const	waitAround = function (ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const fixPath = function(pathOrUrl) {
	if (!pathOrUrl.endsWith("/")) {
		return pathOrUrl + "/";
	}
	return pathOrUrl;
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

// All classes and methods for all reports (testReport & stepReport)

class Report {
  constructor(name) {
    let report = {};
    report['name'] = name;
    report['start'] = Date.now();
    this.report = report;
  }
}

class TestReport extends Report {
  constructor(name, status) {
    super(name);
    this.status = status;
    let steps = [];
    this.report['steps'] = steps;
    
  }

  // Add a step in steps
  addStep(stepReport, status) {
    this.status = status;
    this.report.steps.push(stepReport);
  }

  // Add the end date of the test to the testReport
  // and write the testReport to the file
  end(resultFilePath) {
    this.report['stop'] = Date.now();
    writeToFile(resultFilePath, JSON.stringify(this.report));
  }
}

class StepReport extends Report {
  constructor(name) {
    super(name);
    let attachment = {};
    attachment['type'] = 'json';
    this.attachment = attachment;
  }

  // Create or modify a key/value pair in the attachment
  addAttachment(key, value) {
    this.attachment[key] = value;
  }

  // Add the attachnment, the status and the end date of the step to the stepReport 
  end(status) {
    this.report['attachment'] = this.attachment;
    this.report['status'] = status;
    this.report['stop'] = Date.now();
  }
}



module.exports = {
//	purgeCache: function (moduleName) {
//    searchCache(moduleName, function (mod) {
//      delete require.cache[mod.id];
//    });
//    Object.keys(module.constructor._pathCache).forEach(function(cacheKey) {
//      if (cacheKey.idOf(moduleName)>0) {
//        delete module.constructor._pathCache[cacheKey];
//      }
//    });
//	},

	TestReport,
	StepReport,
	
	
	waitAround,
	
	// todo: appendToFile function

	writeToFile,

	getGlobalVariables: function(process){
		const numberOfParticipant = process.argv[2];
		const id = process.argv[3]; // To identify browsers
		const reportPath = process.argv[4];
		const capabilitiesPath = reportPath + '/' + id + '/capabilities.json';
		const payloadPath = reportPath + '/payload.json';
		const resultFilePath = reportPath + '/' + id + '/result.json';
		const screenshotFolderPath = reportPath + '/' + id + '/screenshots';
		let variables = {
			numberOfParticipant: numberOfParticipant,
			id: id,
			capabilitiesPath: capabilitiesPath,
			payloadPath: payloadPath,
			resultFilePath: resultFilePath,
			screenshotFolderPath: screenshotFolderPath
		}
		return variables; 
	},

	waitForPage: async function(driver, timeout) {
		await driver.wait(isDocumentReady(driver), timeout);
	},

  waitForElement: async function(driver, type, value, timeout) {
    switch(type) {
      case 'id': {
        return driver.wait(waitForElementsWithId(driver, value), timeout);
      }
      case 'className': {
        return driver.wait(waitForElementsWithClassName(driver, value), timeout);
      }
      case 'tagName': {
        return driver.wait(waitForElementsWithTagName(driver, value), timeout);
      }
      default:
        throw new Error('Unsupported wait type: ' + type);
    }
	},
	
	// todo: doc
	getStats: async function(driver, pc, getStatDuration, getStatInterval) {
		const stats = [];
		let i = 0;
		for (i = 0; i < getStatDuration; i += getStatInterval) {
			const stat = await getStatOnce(driver, pc);
			stats.push(stat);
			await waitAround(getStatInterval);
		}
		return stats;
	},

  // todo: doc
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
  takeScreenshot: async function(driver, filePath, fileName) {
    const image = await driver.takeScreenshot();
    fs.writeFile(fixPath(filePath) + fileName, image, 'base64', (err) => {
			if (err) {
				console.log(err);	
			}
		});
    return image;
  }
}
