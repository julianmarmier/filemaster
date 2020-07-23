import React from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>filemaster</h1>
        <h2>The missing file manager for your computer.</h2>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Download now.
        </a>
      </header>
      <img className="screenshot" src="filemaster-screenshot.png" alt="screenshot of app"/>
    </div>
  );
}

export default App;
