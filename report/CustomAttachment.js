const {TestUtils} = require('kite-common');
const fs = require('fs');
const generateUUID = require('./generate-uuid');

/**
 * Class: CustomAttachment
 * Description:
 */
class CustomAttachment {
  constructor(name, type, fileExtention) {
    this.name = name;
    this.type = type;
    this.fileExtention = fileExtention;
    this.uuid = generateUUID();
  }

  setScreenshot(screenshot) {
    this.screenshot = screenshot;
  }

  setText(text) {
    this.text = text;
  }

  isText() {
    return this.screenshot === undefined;
  }

  getJsonBuilder() {
    let builder = {};
    builder['name'] = this.name;
    builder['type'] = this.type;
    builder['source'] = this.uuid + "-attachment." + this.fileExtention;
    return builder;
  }
  
  saveToFile(path) {
    let fileName = path + '/' + this.uuid + "-attachment." + this.fileExtention;
    if (this.isText() && this.text != undefined) {
      let writeStream = fs.createWriteStream(fileName);
      writeStream.write(this.text);
      writeStream.on('finish', () => {
          console.log('wrote all data to file');
      });
      writeStream.end();
      
    } else {
      fs.writeFile(fileName, this.screenshot, 'base64', (err) => {
        if (err) {
          console.log(err);	
        }
      });
    }
  }

}

module.exports = CustomAttachment;