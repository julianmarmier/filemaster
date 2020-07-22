var continueButton = document.getElementById("continue"), list = document.getElementById("fileList"), folderButton = document.getElementById("changeFolder");

window.api.send("folderClick", {action: "loadAll"});
window.api.receive("loadList", function (data) {
  // data should return list of objects containing filePath and name
  document.getElementById("folderName").innerText = data.mainFolder;
  data.favoriteFolders.forEach((folder, i) => {
    list.innerHTML += `<li><span>${i + 1}</span> <p class="remove" onclick="removeFile('${folder.fpath}')">${folder.name}</p></li>`
  });
  appendAddItem(data.length);
})

function appendAddItem(index) {
  var templateItem = document.createElement("LI"), span = document.createElement("span"), docButton = document.createElement("p");
  docButton.setAttribute("onclick","addFile(event, " + index + ")");

  const indexNode = document.createTextNode("＋"), instructionsNode = document.createTextNode("Select a folder…");

  span.appendChild(indexNode);
  docButton.appendChild(instructionsNode);

  templateItem.appendChild(span);
  templateItem.appendChild(docButton);

  list.appendChild(templateItem);
}

// We need ~two~ functions: one to add a new file, and one to remove it.
// Eventually add limit to the amount of addable files, maybe 9

function addFile(event) {
  // have the function return the number, don't rely on it being from the <>li<>
  document.body.classList.toggle("busy");
  res = window.api.sendSync("folderClick", {action: "add"});
  if (res.success) {
    // res: {folderPath, name}
    // increment number, add new li with returned file path, also, remove current
    // const newIndex = list.childNodes.length - 1;
    list.lastChild.remove();
    list.innerHTML += `<li><span>${ res.index + 1 }</span><p class="remove" onclick="removeFile('${res.folderPath}')">${res.name}</p></li>`
    appendAddItem(res.index);
  }
  document.body.classList.toggle("busy");
}

function removeFile(path) {
  // number is off – 1 too many?
  res = window.api.sendSync("folderClick", {action: "remove", folderPath: path});
  // res = index, use the index given to remove that one from list: list.childnodes[x].remove()
  list.removeChild(list.children[res]);
  for (var i = res; i < list.children.length - 1; i++) {
      let currentSpan = list.children[i].getElementsByTagName('span')[0]
      const newIndex = parseInt(currentSpan.innerText) - 1;
      currentSpan.innerText = newIndex;
  }
}

continueButton.addEventListener('click', () => {
  // continue, go to main page. Send another event.
  window.api.send("continue");
})

changeFolder.addEventListener('click', () => {
  window.api.send("startClick");
})

// <li><span class="number">1</span> <p class="link">Select a folder…</p></li>
