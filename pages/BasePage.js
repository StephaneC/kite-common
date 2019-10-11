/*
 * Copyright (C) CoSMo Software Consulting Pte. Ltd. - All Rights Reserved
*/
const {By, Key, until} = require('selenium-webdriver');
module.exports =  class BasePage {

	constructor(driver) {
		this.driver = driver;
	}

	/**
	 * Locates an element
	 * Assuming that the element is being declared as :
	 * const username = By.id('user-name')
	 * could be By. something else (xpath, tagName,...)
	 * @param {By} selector for element
	 * @returns {Promise}
	 */
	async get(selector) {
		await this.waitForElement(selector);
		return this.driver.findElement(selector);
	}

	/**
	 * Navigates to the url and wait for the page to be ready
	 * @param {String} url Reference to the Step object
	 * @param {Number} timeout Time in s before it timeout
	 */
	async open (url, timeout) {
		await this.driver.get(url);
		await this.waitForPage(timeout);
	}


	/**
	 * Waits for page to be ready
	 * @param {Number} timeout Time in s before it timeout
	 */
	async waitForPage ( timeout) {
		await this.driver.wait(this.isDocumentReady(), timeout * 1000);
	}

	/**
	 * Checks if the state the document is "complete"
	 * @returns {Boolean}
	 */
	async isDocumentReady() {
		return await this.driver.executeScript("return document.readyState") === "complete";
	}

	/**
	 * Clears existing text on element
	 * @param {By} selector for element
	 * @returns {Promise}
	 */
	async clearText(selector) {
		try {
			return this.get(selector).clear();
		} catch (e) {
			console.log("Could not clear text of: " + selector, e);
		}
	}

	/**
	 * Sends text to element
	 * @param {By} selector for element
	 * @returns {Promise}
	 */
	async sendKeys(selector, value) {
		try{
			await this.clearText(selector);
			return this.get(selector).sendKeys(value);
		} catch (e) {
			console.log("Could not send text to: " + selector, e);
		}
	}

	/**
	 * Clicks on element
	 * @param {By} selector for element
	 * @returns {Promise}
	 */
	async click(selector) {
		try{
			return this.get(selector).click();
		} catch (e) {
			console.log("Could not send text to: " + selector, e);
		}
	}

	/**
	 * Waits for element to be located
	 * @param {By} selector for element
	 * @returns {Promise}
	 */
	async waitForElement(selector) {
		return this.driver.wait(until.elementLocated(selector), 5000);
	}

	async resize(h, w) {
		return this.driver.manage().window().setRect({height:h, width: w, x:0, y:0});
	}

	/**
	 * Verifies whether element exists and is visible
	 * @param {By} selector for element
	 * @returns {Boolean}
	 */
	async isVisible(selector) {
		try {
			let element = await this.get(selector);
			return (typeof element !== "undefined") && await element.isDisplayed();
		} catch (e) {
			return false;
		}
	}
}