

class RTCStatObject {
  constructor() {
    this.id;
  }

  getStatByName(statObject, statName) {
    let str = (statObject[statName] != undefined) ? statObject[statName] : "NA";
    return str;
  }

  setId(id) {
    this.id = id;
  }
}

module.exports = RTCStatObject;