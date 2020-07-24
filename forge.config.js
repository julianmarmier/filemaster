const path = require('path')

module.exports = {
  "packagerConfig": {
        "icon": "icons/icon.icns"
      },
      "makers": [
        {
          "name": "@electron-forge/maker-deb",
          "config": {
            "options": {
              "homepage": "https://filemaster.julianm.tk",
              "icon": "icons/icon.png",
              "name": "filemaster",
              "genericName": "filemaster"
            }
          }
        },
        {
          "name": "@electron-forge/maker-dmg",
          "config": {
            "icon": "icons/icon.icns",
            "name": "filemaster",
            "background": "icons/background.png",
            "contents": [
              {
                "x": 400,
                "y": 200,
                "type": "link",
                "path": "/Applications"
              },
              {
                "x": 150,
                "y": 200,
                "type": "file",
                "path": "/Users/julian/Downloads/GitHub/filemaster/out/filemaster-darwin-x64/filemaster.app"
              }
            ]
          }
        },
        {
          "name": "@electron-forge/maker-rpm",
          "config": {
            "options": {
              "homepage": "https://filemaster.julianm.tk",
              "icon": "icons/icon.png",
              "name": "filemaster",
              "genericName": "filemaster"
            }
          }
        },
        {
          "name": "@electron-forge/maker-squirrel",
          "config": {
            "iconUrl": path.join(__dirname, "icons", "icon.ico"),
            "setupIcon": path.join(__dirname, "icons", "icon.ico")
          }
        },
        {
          "name": "@electron-forge/maker-zip",
          "platforms": [
            "darwin",
            "linux",
            "windows"
          ]
        }
      ]
}
