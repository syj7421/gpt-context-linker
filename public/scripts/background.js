chrome.runtime.onInstalled.addListener(() => {
    console.log("Service Worker installed successfully.");
  });
  
  chrome.runtime.onStartup.addListener(() => {
    console.log("Service Worker started successfully.");
  });