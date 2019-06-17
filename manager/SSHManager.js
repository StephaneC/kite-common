const SSH2Promise = require('ssh2-promise');

const filePath = function(path) {
  let home = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
  return path.includes("~") ? home.split('\\').join('/') + path.replace("~","")
    : path;
}

class SSHManager {
  constructor(keyFilePath, username, hostIpOrName, commandLine) {
    this.keyFilePath = filePath(keyFilePath);
    this.username = username;
    this.hostIpOrName = hostIpOrName;
    this.commandLine = commandLine;
  }

  async call() {
    let sshconfig = {};
    // let sshconfig = {
    //   host: "",
    //   port: 22,
    //   username: "",
    //   identity: "path"
    // }
    // config
    sshconfig.username = this.username;
    sshconfig.identity = this.keyFilePath;
    if (this.hostIpOrName.includes(":")) {
      let tokens = this.hostIpOrName.split(":");
      sshconfig.host = tokens[0];
      sshconfig.port = tokens[1];
    } else {
      sshconfig.host = this.hostIpOrName; 
      // Default port 22
    }
    
    let ssh = new SSH2Promise(sshconfig);
    let data = "";
    try {
      await ssh.connect();
      console.log("Connection established");
      data = await ssh.exec(this.command);
    } catch (e) {
      console.log(e);
    } finally {
      if (typeof ssh !== "undefined") {
        await ssh.close();
      }
    }
    return data;
  }
}

module.exports = SSHManager;