/* global chrome */
import './App.css';

function App() {

  function startTagging() {
    // Send a message to the content script to inject checkboxes
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "start-tagging" });
    });
  }

  return (
    <div className="App">
      <h1>GPT Context Linker</h1>
      <button onClick={startTagging}>Start Tagging Messages</button>
    </div>
  );
}

export default App;
