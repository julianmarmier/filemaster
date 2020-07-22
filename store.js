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

  pull(key, pullValue) {
    //  if ((key in this.data) && (Array.isArray(this.data[key]))) {
    _.pull(this.data[key], pullValue);
    fs.writeFileSync(this.path, JSON.stringify(this.data));
    //}
  }
}

function parseDataFile(filePath, defaults) {
  try {
    return JSON.parse(fs.readFileSync(filePath));
  } catch (error) {
    return defaults;
  }
}

module.exports = Store;
