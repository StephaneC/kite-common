const KiteTestError = require('../report/KiteTestError');
const Status = require('../report/Status');
const Instance = require('./Instance');
const NetworkProfile = require('./NetworkProfile');

/**
 * @class NetworktInstrumentation
 * @description Instantiates a new NetworktInstrumentation
 * @constructor NetworktInstrumentation(jsonObject, instrumentalUrl, remoteAddress)
 * @param {JSON} jsonObject The json object
 * @param {String} remoteAddress The remote address
 * @param {String} kiteServerGridId The kite server grid id
 */
class NetworkInstrumentation {
  constructor(jsonObject, remoteAddress, kiteServerGridId) {
    this.remoteAdress = remoteAddress;
    this.instances = null;
    this.kiteServerGridId = null;
    this.networkProfiles = null;
    this.kiteServer = null;
    this.networkProfiles = {};
    let missingKey;
    let jsonArray;
    let networkProfile;
    if (kiteServerGridId) { // Kite Server Test Manager
      this.kiteServerGridId = kiteServerGridId;
      this.kiteServer = jsonObject.kiteServer ? jsonObject.kiteServer : "http://localhost:8080/KITEServer";
    } else { // Kite Engine Test manager
      jsonArray = jsonObject.instances;
      this.instances = {};
      for (let i = 0; i < jsonArray.length; i++) {
        try {
          let instance = new Instance(jsonArray[i]);
          this.instances[instance.getId()] = instance;
        } catch (e) {
          console.log(e);
          throw new KiteTestError(Status.Broken, "Error in json config instances.");
        }
      }
    }
    jsonArray = jsonObject.networkProfiles;
    for (let i = 0; i < jsonArray.length; i++) {
      try {
        missingKey = "networkProfile";
        networkProfile = new NetworkProfile(jsonArray[i]);
        this.networkProfiles[networkProfile.getName()] = networkProfile;
      } catch (e) {
        console.log(e);
        throw new KiteTestError(Status.Broken, "Error in json config networkProfiles, the key " + missingKey + " is missing.");
      }
    }
  }

  /**
   * Gets remote address
   * @returns {String} The remote address
   */
  getRemoteAddress() {
    return this.remoteAddress;
  }

  /**
   * Gets instance 
   * @returns {String} Instances
   */
  getInstances() {
    return this.instances;
  }

  /**
   * Gets network profiles 
   * @returns {String} network profiles
   */
  getNetworkProfiles() {
    return this.networkProfiles;
  }

  /**
   * Gets kite server grid id
   * @returns {String} The kite server grid id
   */
  getKiteServerGridId() {
    return this.kiteServerGridId;
  }

  /**
   * Gets kite server  
   * @returns {String} The kite server
   */
  getKiteServer() {
    return this.kiteServer;
  }
}

module.exports = NetworkInstrumentation;