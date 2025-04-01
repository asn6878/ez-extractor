// background.js
chrome.action.onClicked.addListener(async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.windows.create({
    url: `window.html?targetTabId=${tab.id}`,
    type: "popup",
    width: 400,
    height: 600,
  });
});
