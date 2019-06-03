const fs = require('fs');
const generateUUID = require('./generate-uuid');

/**
 * Class: CustomAttachment
 * Description: Create a custom attachment
 */
class CustomAttachment {
  /**
   * Constructor of the CustomAttachment class
   * @param {*} name CustomAttachment name
   * @param {*} type CustomAttachment type
   * @param {*} fileExtension Extension of the attachment
   */
  constructor(name, type, fileExtension) {
    this.name = name;
    this.type = type;
    this.fileExtension = fileExtension;
    this.uuid = generateUUID();
  }

  /**
   * Sets the screenshot
   * @param {Object} screenshot 
   */
  setScreenshot(screenshot) {
    this.screenshot = screenshot;
  }

  /**
   * Sets the text
   * @param {String} text 
   */
  setText(text) {
    this.text = text;
  }

  /**
   * Checks if it's a text or not
   * @return {Boolean}
   */
  isText() {
    return typeof this.screenshot === "undefined";
  }

  /**
   * Returns the json object corresponding to the attachment
   * @return {JSON}
   */
  getJsonBuilder() {
    let builder = {};
    builder['name'] = this.name;
    builder['type'] = this.type;
    builder['source'] = this.uuid + "-attachment." + this.fileExtension;
    return builder;
  }
  
  /**
   * Saves the information in a file
   * @param {String} path Path to the file
   */
  saveToFile(path) {
    let fileName = this.uuid + "-attachment." + this.fileExtension;
    if (this.isText() && typeof this.text !== "undefined") {
      let writeStream = fs.createWriteStream(path + '/' + fileName);
      writeStream.write(this.text);
      writeStream.on('finish', () => {
          console.log('wrote all data to file');
      });
      writeStream.end();
      
    } else {
      fs.writeFile(path + '/screenshots/' + fileName, this.screenshot, 'base64', (err) => {
        if (err) {
          console.log(err);	
        }
      });
    }
  }

}

module.exports = CustomAttachment;