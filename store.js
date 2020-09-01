const electron = require('electron');
const path = require('path');
const fs = require('fs');

var _ = require('lodash');

class Store {
  constructor(opts) {
      // Options: configName:
      const userDataPath = (electron.app || electron.remote.app).getPath('userData');
      this.path = path.join(userDataPath, opts.configName + '.json');
      this.data = parseDataFile(this.path, opts.defaults);
  }

  get(key) {
    return this.data[key]
  }

  set(key, val) {
    this.data[key] = val;
    fs.writeFileSync(this.path, JSON.stringify(this.data));
  }

  push(key, pushData) {
    // if ((key in this.data) && (Array.isArray(this.data[key]))) {
    this.data[key].push(pushData);
    fs.writeFileSync(this.path, JSON.stringify(this.data));
    // }
  }

  pushAction(key, type, filePath, newFilePath) {
      this.data[key].push(new Action(type, filePath, newFilePath));
      fs.writeFileSync(this.path, JSON.stringify(this.data));
  }

  pull(key, pullValue) {
    //  if ((key in this.data) && (Array.isArray(this.data[key]))) {
    _.pull(this.data[key], pullValue);
    fs.writeFileSync(this.path, JSON.stringify(this.data));
    //}
  }

  pop(key, popValue) {
    const res = this.data[key].pop();
    fs.writeFileSync(this.path, JSON.stringify(this.data))
    return res;
  }
}

function parseDataFile(filePath, defaults) {
  console.log(filePath)
  try {
    finalData = JSON.parse(fs.readFileSync(filePath));
    // check finalData against defaults to see if there is anything left

    for (var key in defaults) {
      if (! (key in finalData)) {
        finalData[key] = defaults[key];
      }
    }

    // Write updated data
    fs.writeFileSync(filePath, JSON.stringify(finalData));
    return finalData;
  } catch (error) {
    return defaults;
  }
}

class Action {
  constructor(type, filePath, newFilePath) {
      this.type = type;
      this.filePath = filePath;
      this.newFilePath = newFilePath;
  }

  undo() {
    // undo the current action. this should simply return a standarized format for
    // the previous action.
    switch (this.type) {
      case "KEEP":
      case "REMOVE":
      // simply show the previous file again…
      // return fs.statsSync(this.filePath)
      // we need to set up another array of dirents to read until there are no more.
      return {"file": path.basename(this.filePath), "size": fs.statSync(this.filePath).size, "path": this.filePath, "prevFile": this.filePath}
      // let's say the object above is our own <File> type. Add this to the temporary list of files left to go through.
      break;
      case "MOVE":
      // should have some sort of relatio
      return {"file": path.basename(this.filePath), "size": fs.statSync(this.filePath).size, "path": this.filePath, "prevFile": this.filePath}
      break;
    }
  }
}

module.exports = Store;
