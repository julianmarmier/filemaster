import React from 'react';
import logo from './logo.svg';
import './App.css';

function getPlatform() {
  const osString = navigator.appVersion
  let os = null, link = "https://github.com/julianmarmier/filemaster/releases/latest"
  if (osString.includes("Win")) {os = "Windows"; link = "https://github.com/julianmarmier/filemaster/releases/latest/download/filemaster.setup.exe"}
  else if (osString.includes("Mac")) {os = "macOS"; link = "https://github.com/julianmarmier/filemaster/releases/latest/download/filemaster.dmg"}
  else if (osString.includes("Linux")) {os = "Linux"; link = {"deb": "https://github.com/julianmarmier/filemaster/releases/latest/download/filemaster.deb", "rpm": "https://github.com/julianmarmier/filemaster/releases/latest/download/filemaster.rpm"}}

  return {"operatingSystem": os, "link": link}
}

function DownloadLink() {
  const osInfo = getPlatform()
  if (osInfo.operatingSystem === "Linux") {
    // two links
    return (
      <>
        <a className="App-link" href={osInfo.link.deb}>
          Download deb package
        </a>
        <a className="App-link" href={osInfo.link.rpm}> 
          Download rpm package
        </a>
      </>
    )
  } else if (osInfo.operatingSystem === null) {
    // not available for your platform
    return (
      <a className="App-link unavailable">Unavailable for your platform</a>
    )
  } else {
    return (
      <a 
        className="App-link"
        href={osInfo.link}
        target="_blank"
        rel="noopener noreferrer"
      >
        Download for {osInfo.operatingSystem}  
      </a>
    )
  }
}

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>filemaster</h1>
        <h2>The missing file manager for your computer.</h2>
        <DownloadLink />
        <p>{getPlatform() ? `Not downloading for ${getPlatform().operatingSystem}? ` : null }<a href="https://github.com/julianmarmier/filemaster/releases/latest" >See all releases.</a></p>
      </header>
      <img className="screenshot" src="filemaster-screenshot.png" alt="screenshot of app"/>
    </div>
  );
}

export default App;
