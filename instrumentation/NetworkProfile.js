const KiteTestError = require('../report/KiteTestError');
const Status = require('../report/Status');
const INTERFACE_0_NAME = "enp0s8";
const INTERFACE_1_NAME = "enp0s9";

/**
 * @class NetworkProfile
 * @description 
 * @constructor NetworkProfile(jsonObject)
 * @param {JSON} jsonObject
 */
class NetworkProfile {
  constructor(jsonObject) {
    this.delay = jsonObject.delay ? jsonObject.delay : 0 ;
    this.packetloss = jsonObject.packetloss ? jsonObject.packetloss : 0;
    this.corrupt = jsonObject.currupt ? jsonObject.currupt : 0;
    this.duplicate = jsonObject.duplicate ? jsonObject.duplicate : 0;
    this.bandwith = jsonObject.bandwith ? jsonObject.bandwith : 0;
    this.command = Object.keys(jsonObject).includes("command") ? "" + jsonObject.command : this.setCommand();
    this.nit = (this.command.indexOf(INTERFACE_0_NAME) > -1) ? INTERFACE_0_NAME : INTERFACE_1_NAME;
  }

  setCommand() {
    let egress_command = "";
    let ingress_command = "";
    let command = "sudo ip link add ifb0 type ifb || true && sudo ip link set up dev ifb0 || true && sudo tc qdisc add dev " + INTERFACE_0_NAME + " ingress || true && sudo tc filter add dev " + INTERFACE_0_NAME + " parent ffff: protocol ip u32 match u32 0 0 action mirred egress redirect dev ifb0 || true && ";
    if (this.delay != 0) {
      egress_command = this.createCommand(egress_command, "delay " + this.delay + "ms ", INTERFACE_0_NAME);
      ingress_command = this.createCommand(ingress_command, "delay " + this.delay + "ms ", "ifb0");
    }

    if (this.packetloss != 0) {
      egress_command = this.createCommand(egress_command, "loss " + this.packetloss + "% ", INTERFACE_0_NAME);
      ingress_command = this.createCommand(ingress_command, "loss " + this.packetloss + "% ", "ifb0");
    }

    if (this.currupt != 0) {
      egress_command = this.createCommand(egress_command, "corrupt " + this.corrupt + "% ", INTERFACE_0_NAME);
      ingress_command = this.createCommand(ingress_command, "corrupt " + this.corrupt + "% ", "ifb0");
    }

    if (this.duplicate != 0) {
      egress_command = this.createCommand(egress_command, "duplicate " + this.duplicate + "% ", INTERFACE_0_NAME);
      ingress_command = this.createCommand(ingress_command, "duplicate " + this.duplicate + "% ", "ifb0");
    }

    if (this.bandwith != 0) {
      egress_command = this.createCommand(egress_command, "rate " + this.bandwith + "kbit ", INTERFACE_0_NAME);
      ingress_command = this.createCommand(ingress_command, "rate " + this.bandwith + "kbit ", "ifb0");
    }

    command = command + egress_command + "|| true && " + ingress_command;
    if (egress_command === "" && ingress_command === "") {
      throw new KiteTestError(Status.BROKEN, "No command to run");
    } else {
      return command;
    }
  }
  
  /**
   * Gets command
   * @returns {String} The command
   */
  getCommand() {
    return this.command;
  }

  /**
   * Gets interface 
   * @returns {String} The interface
   */
  getInterface() {
    return this.nit;
  }

  /**
   * Creates a command
   * @param {String} command 
   * @param {String} info 
   * @param {String} nit
   * @returns {String} The command 
   */
  createCommand(command, info, nit) {
    if (command === "") {
      command = "sudo tc qdisc replace dev " + nit + " root netem " + info;
    } else {
      command = command + info;
    }
    return command;
  }
}

module.exports = NetworkProfile;