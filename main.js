// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain, dialog, shell} = require('electron')
const path = require('path')
const fs = require('fs')
const Store = require('./store.js')

const FileType = require('file-type')
const readChunk = require('read-chunk')

var mainWindow, fileDirectory;

//  TESTING
require('electron-reload')(__dirname, {
  electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
  hardResetMethod: 'exit'
});

// "*" means that the variable is unitialized

const store = new Store({
  configName: "user-preferences",
  defaults: {
    mainFolder: "*",
    favoriteFolders: [],
    finishedSetup: false,
    showInstructions: true
  }
})

const actionList = new Store({
  configName: "action-log",
  defaults: {
    userActions: [],
    undoActions: [],
    trashActions: []
  }
})

function readNextFile(e, fileAction, previousFile, previousFolder) {
  // previousFolder is only required if fileAction is of type "switch"
  // this function needs to handle two cases: A). new user action, B). undo/redo actions.
  // if there are still objects left in the undoActions

  let looping = true
  const folderDir = store.get('mainFolder');
  if (actionList.get("undoActions").length > 0) {
    // if there are still objects left in the temporary list, return those.
    // get last temp list items
    const temp = actionList.pop("undoActions");
    e.reply("fileResponse", {...temp, action: fileAction});
  } else {
    while (looping) {
      const entry = fileDirectory.readSync()
      if (entry === null) {
        // no more files… null!
        fileDirectory.closeSync();
        e.reply("fileResponse", {action: "finished"});
        looping = false;
      } else if (entry.isFile()) {
        // load the file as a buffer
        const filePath = path.join(folderDir, entry.name);
        const fileBuffer = readChunk.sync(filePath, 0, 4100);
        const fileData = {}

        // use file-type to determine the MIME type, then handle from there.
        const currentFileType = FileType.fromBuffer(fileBuffer);
        const mimeType = /\w*(?=\/)/g.exec(currentFileType);

        if (mimeType === text) {
          // this is text, should return the buffer
          fileData = {type: "text", buffer: fileBuffer.toString()}
        }

        const fileSize = fs.statSync(filePath).size;
        // another if…else - check if there is a previousFolder
        if (previousFolder) {
          e.reply("fileResponse", {file: entry.name, data: fileData, size: fileSize, path: filePath, action: fileAction, prevFile: previousFile, prevFolder: previousFolder});
        } else {
          e.reply("fileResponse", {file: entry.name, data: fileData, size: fileSize, path: filePath, action: fileAction, prevFile: previousFile});
        }
        looping = false;
      }
    }
  }
}

ipcMain.on("fileUpdate", (event, arg) => {
  const folderDir = store.get('mainFolder');
  switch (arg.action) {
    case "loadFiles":
      // get all files from mainFolder.
      fs.opendir(folderDir, (err, dir) => {
        fileDirectory = dir;
        readNextFile(event, "load");
      })
      break;
    case "keep":
      actionList.pushAction("userActions", "KEEP", arg.path);
      readNextFile(event, "keep", path.basename(arg.path));
      // return the next file from the list
      break;
    case "switch":
      // send currentFile to arg.folderPath using
      const finalPath = path.join(arg.folder, path.basename(arg.path));
      actionList.pushAction("userActions", "MOVE", arg.path, finalPath);
      fs.renameSync(arg.path, finalPath);
      readNextFile(event, "switch", path.basename(arg.path), path.basename(arg.folder));
      break;
    case "remove":
    // use current folder path given
      actionList.push("trashActions", arg.path);
      actionList.pushAction("userActions", "REMOVE", arg.path)
      readNextFile(event, "remove", path.basename(arg.path));
      break;
  }
})

ipcMain.on("startClick", function () {
  dialog.showOpenDialog({
    properties: ['openDirectory']
  }).then(function (res) {
    if (!res.canceled) {
      store.set("mainFolder",  res.filePaths[0])
      updateWindow(700, 600, "choose")
    }
  })
})

ipcMain.on("folderClick", (event, arg) => {
  switch (arg.action) {
    case "add":
      dialog.showOpenDialog({
        properties: ['openDirectory']
      }).then(function (res) {
        if(res.canceled) {
          event.returnValue = {success: false};
        } else {
          // now check if the file already exists.
          let currentFolderPath = res.filePaths[0];
          if ((store.get("favoriteFolders").indexOf(currentFolderPath) != -1) || (currentFolderPath === store.get('mainFolder'))) {
            // IDEA: Show error to the user
            event.returnValue = {success: false};
          } else {
            store.push("favoriteFolders", currentFolderPath);
            const lastIndex = store.get("favoriteFolders").length - 1;
            event.returnValue = {success: true, folderPath: currentFolderPath, name: path.basename(currentFolderPath), index: lastIndex};
          }
        }
      })
      break;
      case "loadAll":
        // return list of objects
        const favFolders = store.get("favoriteFolders");
        let retList = [];
        favFolders.forEach((folder) => {
          retList.push({fpath: folder, name: path.basename(folder)});
        });

        const result = {folderDir: path.dirname(store.get("mainFolder")) + path.sep, mainFolder: path.basename(store.get("mainFolder")), favoriteFolders: retList, showInstructions: store.get("showInstructions")}
        event.reply("loadList", result)
        break;
      case "remove":
        const removedIndex = store.get("favoriteFolders").indexOf(arg.folderPath);
        store.pull("favoriteFolders", arg.folderPath)
        event.returnValue = removedIndex;
      break;
  }
})

ipcMain.on("continue", (event, arg) => {
  // load the main page
  store.set("finishedSetup", true);
  updateWindow(800, 600, "home", true);
})

ipcMain.on("openPath", (event, link) => {
  shell.openPath(link);
})

ipcMain.on("openSettings", () => {
  updateWindow(800, 600, "choose")
})

ipcMain.on("prefsChange", (event, arg) => {
  store.set(arg.key, arg.value)
})

ipcMain.on("undo", (event) => {
  if (actionList.get("userActions").length > 0) {
    const lastAction = actionList.pop("userActions");
    const newAction = lastAction.undo();

    if (lastAction.type === "REMOVE") {
      actionList.pull("trashActions", lastAction.path)
    }

    actionList.push("undoActions", newAction);
    readNextFile(event, "restore", path.basename(lastAction.name));
  }
})

function onStart() {
  if (store.get('mainFolder') === "*") {
    createWindow(500, 500, "getting-started")
  } else {
    // load app directly, unless favorite folders haven't been chosen
    if (store.get('favoriteFolders').length === 0 || !store.get("finishedSetup")) {
      createWindow(700, 600, "choose");
    } else {
      createWindow(800, 600, "home", true);
    }
  }
}

function createWindow (w, h, link, resize = false) {
  // resize = (typeof resize !== 'undefinded') ? resize : true;
  // Create the browser window.

  mainWindow = new BrowserWindow({
    titleBarStyle: "hidden",
    width: w,
    height: h,
    resizable: resize,
    webPreferences: {
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true
    }
  })

  // and load (link).html
  mainWindow.loadFile(`pages/${link}.html`)

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

function updateWindow(w, h, newLink, resize = false) {
  mainWindow.setResizable(resize);
  mainWindow.setSize(w, h, true);
  mainWindow.loadFile(`pages/${newLink}.html`);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  onStart();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow(500, 500)
  })

  app.on('will-quit', function () {
    // delete temporary action files to save space
    // delete all items in actionList
    actionList.get("trashActions").forEach((fpath) => {
        shell.moveItemToTrash(fpath, true)
    });

    shell.moveItemToTrash(path.join(app.getPath("userData"), "action-log.json"));
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
