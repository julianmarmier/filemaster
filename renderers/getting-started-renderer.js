var startButton = document.getElementById('fileSelect');

startButton.addEventListener('click', function () {
  window.api.send('startClick');
})
