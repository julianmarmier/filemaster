module.exports = {
  makers: [
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
        "background": "icons/background.png"
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
        "exe": "filemaster",
        "iconUrl": "icons/icon.ico",
        "setupIcon": "icons/icon.ico"
      }
    }
  ]
}
