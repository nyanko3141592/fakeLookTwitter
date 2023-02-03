/**
 * 初回実行時の状態格納
 */
chrome.storage.local.get(["isRun"], (result) => {
  console.log("bg result", result);
  if (!result.hasOwnProperty("isRun")) {
    chrome.storage.local.set({ isRun: true });
  }
  changeIcon(result.isRun || true);
});

// click event
chrome.action.onClicked.addListener((tab) => {
  chrome.storage.local.get(["isRun"], (result) => {
    chrome.storage.local.set({ isRun: !result.isRun });
  });
});

// observe storage change
chrome.storage.onChanged.addListener((changes, namespace) => {
  console.log("changes", changes);
  for (key in changes) {
    if (key == "isRun") {
      changeIcon(changes["isRun"].newValue);
    }
  }
});

// switch icon
function changeIcon(isRun) {
  if (isRun) {
    chrome.action.setTitle({ title: "FakeLookTwitter : ON" });
    chrome.action.setIcon({ path: "asset/logo128.png" });
  } else {
    chrome.action.setTitle({ title: "FakeLookTwitter : OFF" });
    chrome.action.setIcon({ path: "asset/logo128-off.png" });
  }
}

// initialize
chrome.action.setIcon({ path: "asset/logo128.png" });
