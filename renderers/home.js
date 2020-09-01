// let's start by loading everything into our DOM.
var titleInfo = document.getElementById("home-title"), folderButton = document.getElementById("name"), folderList = document.getElementById("allFolders"), undoButton = document.getElementById("undo-button");
var bottom = document.getElementById("bottom-action"), left = document.getElementById("left-action"), right = document.getElementById("right-action"), card = document.getElementById("card");
var leftAnimator = document.getElementById("left-anim"), rightAnimator = document.getElementById("right-anim"), bottomAnimator = document.getElementById("bottom-anim");
var userMessage = document.getElementById("message");

// card stuff
var cardFileName = document.getElementById("fileName"), cardFileSize = document.getElementById("fileSize"), cardOpenButton = document.getElementById("openButton"), finishCard = document.getElementById("finished"), thumbnail = document.getElementById("thumbnail-area");
var currentFolderPath;

var modal = document.getElementById("infoModal"), modalWrapper = document.getElementById("infoWrapper"), instructionsCheck = document.getElementById("instructions-prefs");

const changeFields = [bottom, left, right, folderList, card, thumbnail];
var foldersActive = false;

// Bind keys to actions: beginning

Mousetrap.bind('left', (e) => {
  if (!foldersActive) removePath()
})
Mousetrap.bind('right', (e) => {
  if (!foldersActive) keepPath()
})
Mousetrap.bind('down', (e) => {
  foldersActive ? foldersActive = false : foldersActive = true

  changeFields.forEach((item) => {
      item.classList.toggle("click");
  });
})
Mousetrap.bind('f', (e) => {
  window.api.send("openSettings")
})

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function animateSuccess(messageType, fileName, newFolder) {
  // new folder is an optional argument
  let animator;
  switch (messageType) {
    case "keep":
      // keeps
      animator = rightAnimator;
      userMessage.innerHTML = `<span class="fas fa-check"></span> Kept ${fileName}`;
      break;
    case "remove":
      animator = leftAnimator;
      userMessage.innerHTML = `<span class="fas fa-trash"></span> Deleted ${fileName}`;
      break;
    case "switch":
      animator = bottomAnimator;
      userMessage.innerHTML = `<span class="fas fa-folder"></span> ${fileName} → ${newFolder}`;
      changeFields.forEach((item) => {
        item.classList.remove("click");
      });
      foldersActive = false;
      break;
    case "restore":
      userMessage.innerHTML = `<span class="fas fa-restore"></span> Restored ${fileName}`;
      break;
  }

  userMessage.classList.add("animated");
  animator.classList.add("animated");

  window.setTimeout(() => {
    userMessage.classList.remove("animated");
  }, 2500)

  window.setTimeout(() => {
    animator.classList.remove("animated");
  }, 1000)

}

function showModal(modalType) {
  modalWrapper.classList.add("modal-visible");
  modal.classList.add("modal-visible");
}

function hideModal(modalType) {
  if (modalType === "instructions") {
    if (instructionsCheck.checked) {
        window.api.send("prefsChange", {"key": "showInstructions", "value": false})
    }
  }

  modalWrapper.classList.remove("modal-visible");
  modal.classList.remove("modal-visible");
}

window.api.send("folderClick", {
  action: "loadAll"
});

window.api.send("fileUpdate", {
  action: "loadFiles"
})

window.api.receive("fileResponse", (res) => {
  if (res.action === "finished") {
    // all files have been looped through - prompt to restart
    // hide controls:
    for (const item of [left, bottom, right]) {
      item.style.display = "none";
    }

    Mousetrap.reset();

    finished.style.display = "flex";
    card.style.display = "none";

    Mousetrap.bind("enter", () => {
        window.location.reload()
    })
    Mousetrap.bind("f", () => {
      window.api.send("openSettings");
    })

  } else {
    fileName.innerText = res.file;
    fileSize.innerText = formatBytes(res.size)
    currentFolderPath = res.path;
    Mousetrap.bind("o", () => {openPath(res.path)})
    cardOpenButton.onclick = function () {
      openPath(res.path)
    }

    if ("prevFolder" in res) {
      animateSuccess(res.action, res.prevFile, res.prevFolder)
    } else if (res.action !== "load") {
      animateSuccess(res.action, res.prevFile)
    }
  }
})

window.api.receive("loadList", (data) => {
  // data: favoriteFolders, mainFolder, folderDir
  // folderData = data; // not sure why I need this, I think I meant to load all the files into this.
  let i = 0;
  for (const text of [data.folderDir, data.mainFolder]) {
      titleInfo.children[i].innerText = text;
      i++;
  }

  if(data.showInstructions) {
    showModal("instructions");
    Mousetrap.bind("enter", () => {
      hideModal("instructions")
    });
  }

  data.favoriteFolders.forEach((folder, i) => {
    let listItem = document.createElement("li");
    listItem.innerHTML += `<h2>${i + 1}</h2><span class="fas fa-folder"></span><p>${folder.name}</p>`

    const pathSend = i + 1

    Mousetrap.bind(pathSend.toString(), () => {
      if (foldersActive) sendToPath(folder.fpath);
    })

    listItem.addEventListener('click', () => {
      // define what happens here
      // maybe make a popup that asks: press enter or ok to confirm
      sendToPath(folder.fpath);
      // change to next file on fileResponse && successful
    })
    folderList.appendChild(listItem)
  });
})

function openPath(pathLink) {
  window.api.send("openPath", pathLink);
}

function keepPath() {
    window.api.send("fileUpdate", {action: "keep", path: currentFolderPath})
}

function removePath() {
  window.api.send("fileUpdate", {action: "remove", path: currentFolderPath})
}

function sendToPath(pathLink) {
    window.api.send("fileUpdate", {action: "switch", path: currentFolderPath, folder: pathLink});
}

left.addEventListener('click', () => {
  removePath();
})
right.addEventListener('click', () => {
  keepPath();
})
bottom.addEventListener('click', () => {
  //show all other folders
  foldersActive ? foldersActive = false : foldersActive = true;

  changeFields.forEach((item) => {
      item.classList.toggle("click");
  });

})

folderButton.addEventListener('click', () => {
  // go back to settings page.
  window.api.send("openSettings");
})

undoButton.addEventListener('click', () => {
  window.api.send("undo");
})
