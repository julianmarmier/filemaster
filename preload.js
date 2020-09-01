// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld(
    "api", {
        send: (channel, data) => {
            // whitelist channels
            let validChannels = ["startClick", "folderClick", "continue", "openPath", "fileUpdate", "openSettings", "prefsChange", "undo"];
            if (validChannels.includes(channel)) {
                ipcRenderer.send(channel, data);
            }
        },
        sendSync: (channel, data) => {
          let validChannels = ["folderClick"];
          if (validChannels.includes(channel)) {
              return ipcRenderer.sendSync(channel, data);
          }
        },
        receive: (channel, func) => {
            let validChannels = ["folderResponse", "loadList", "fileResponse"];
            if (validChannels.includes(channel)) {
                // Deliberately strip event as it includes `sender`
                ipcRenderer.on(channel, (event, ...args) => func(...args));
            }
        },
        once: (channel, func) => {
          let validChannels = ["folderResponse"];
          if (validChannels.includes(channel)) {
              ipcRenderer.once(channel, (event, ...args) => func(...args));
          }
        }
    }
);
