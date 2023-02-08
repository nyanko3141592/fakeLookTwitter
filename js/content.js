var searchForm;
var saveChannel;
var isChannelShow = true;
var workspaceTitle = "Slacker";
var isEnable = true;
const channelTitleMaxLength = 19;
const defaultChannel = [
  ["home", "/home"],
  ["notification", "/notifications"],
  ["explore", "/explore"],
  ["bookmark", "/i/bookmarks"],
  ["profile", "/"],
];

if (localStorage.getItem("saveChannel") != null) {
  saveChannel = JSON.parse(localStorage.getItem("saveChannel"));
}
if (localStorage.getItem("workspaceTitle") != null) {
  workspaceTitle = localStorage.getItem("workspaceTitle");
}

chrome.storage.onChanged.addListener((changes, namespace) => {
  console.log("changes", changes);
});

function isDefaultChannelURL(checkURL) {
  defaultChannel.forEach((element) => {
    if (checkURL == element[1]) {
      return true;
    }
  });
  return false;
}

function addHtmlToBody(htmlPath) {
  // jquery load text file
  path = chrome.runtime.getURL(htmlPath);
  // dataが読み込まれるまで待つ
  var htmlText = $.ajax({
    url: path,
    async: false,
  }).responseText;
  // get the body element
  var body = document.getElementsByTagName("body")[0];
  var div = document.createElement("div");
  // change background color
  div.innerHTML = htmlText;
  body.appendChild(div);
  return div;
}

function twitterSearch(e) {
  if (e.keyCode === 13) {
    window.location.href = "https://twitter.com/search?q=" + searchForm.value;
  }
  return false;
}

function makeChannelTitle(url) {
  var a = url.replace("https://twitter.com/", "");
  if (a == "") {
    a = "home";
  } else if (a == "home") {
    a = "home";
  } else if (a == "notifications") {
    a = "notification";
  } else if (a == "explore") {
    a = "explore";
  } else if (a == "i/bookmarks") {
    a = "bookmark";
  } else if (url.includes("search")) {
    a = url.replace("https://twitter.com/search?q=", "");
  } else if (url.includes("hashtag")) {
    a = url.replace("https://twitter.com/hashtag/", "");
  } else if (url.includes("lists")) {
    a = "list";
  } else if (url.includes("moments")) {
    a = "moment";
  } else if (!a.includes("/")) {
    a = "times_" + url.replace("https://twitter.com/", "");
  }
  if (a.includes("?")) {
    a = a.split("?")[0];
  } else if (a.includes("&")) {
    a = a.split("&")[0];
  } else if (a.includes("/status")) {
    a = a.split("/status")[0];
  }
  return decodeUrlEncodedString(a);
}

// add channel
function addChannelUI(elementArray) {
  console.log(elementArray);
  var channel = document.createElement("li");
  var channelLink = document.createElement("a");
  var deleteButton = document.createElement("button");
  channelLink.href = elementArray[1];
  // set channel name
  if (elementArray[0].length > channelTitleMaxLength) {
    channelLink.innerText =
      "# " + elementArray[0].slice(0, channelTitleMaxLength) + "...";
  } else {
    channelLink.innerText = "# " + elementArray[0];
  }
  // set event lister
  document.getElementById("channelList").appendChild(channel);
  if (elementArray[0] == "profile") {
    console.log("profile");
    channelLink.id = "profile";
    channel.addEventListener("click", function () {
      document
        .querySelectorAll('[data-testid="AppTabBar_Profile_Link"]')[0]
        .click();
    });
  } else {
    document.getElementById("channelList").appendChild(channel);
    channelLink.id = elementArray[0];
    // li 全体にリンクを追加
    channel.addEventListener("click", function () {
      window.location.href = elementArray[1];
    });
  }
  unreadChannelBold();
  channel.appendChild(channelLink);
  // add delete button
  deleteButton.innerText = "×";
  deleteButton.className = "deleteButton";
  deleteButton.addEventListener("click", function () {
    // delete channel
    for (let i = 0; i < saveChannel.length; i++) {
      if (saveChannel[i][0] == elementArray[0]) {
        // confirm
        if (!confirm("delete " + elementArray[0] + "channel?")) {
          return;
        }
        saveChannel.splice(i, 1);
        localStorage.setItem("saveChannel", JSON.stringify(saveChannel));
        break;
      }
    }
    // delete channel UI
    channel.remove();
  });
  channel.appendChild(deleteButton);
  // delete button display check
  defaultChannel.forEach((element) => {
    if (elementArray[1] == element[1]) {
      deleteButton.style.display = "none";
      return;
    }
  });
}

function backButton() {
  window.history.back();
}

function addchannel() {
  const nowURL = window.location.href;
  // 既に追加されているかチェック:デフォルトチャンネル
  if (isDefaultChannelURL(nowURL)) {
    alert("already added");
    return;
  }
  // 既に追加されているかチェック：追加分
  for (let i = 0; i < saveChannel.length; i++) {
    if (
      saveChannel[i][1] == nowURL ||
      saveChannel[i][0] == makeChannelTitle(nowURL)
    ) {
      alert("already added");
      return;
    }
  }
  saveChannel.push([makeChannelTitle(nowURL), nowURL]);
  localStorage.setItem("saveChannel", JSON.stringify(saveChannel));
  addChannelUI(saveChannel[saveChannel.length - 1]);
  alert("channel added");
}

function setChannelTitle() {
  // チャンネルタイトルを表示
  document.getElementById("channelTitle").innerText =
    "# " + makeChannelTitle(window.location.href);
}

chrome.storage.local.get(["isRun"], (result) => {
  isEnable = result.isRun;
});

window.onload = function () {
  console.log("isEnable: " + isEnable);
  if (!isEnable) {
    return;
  }
  addCss("css/content.css");
  addCss("css/injectedFile.css");
  addHtmlToBody("html/sidebar.html").style.height =
    window.innerHeight - 44 + "px";
  addHtmlToBody("html/searchBar.html");
  addHtmlToBody("html/channelHeader.html");
  document.getElementById("backButton").addEventListener("click", backButton);
  // 検索バーのイベントリスナーを追加
  searchForm = document.getElementById("searchInputForm");
  searchForm.addEventListener("keypress", twitterSearch);
  // channel 追加
  if (saveChannel == null || saveChannel == undefined) {
    saveChannel = defaultChannel;
  }
  saveChannel.forEach((element) => {
    addChannelUI(element);
  });
  // addchannel event listener
  var addchannelButton = document.getElementById("addChannel");
  addchannelButton.addEventListener("click", addchannel);
  // チャンネルタイトルを表示
  setChannelTitle();
  // 通知
  unreadChannelBold();
  // workspace title
  workspaceTitleElement = document.getElementById("workspaceTitle");
  workspaceTitleElement.value = workspaceTitle;
  workspaceTitleElement.placeholder = workspaceTitle;
  workspaceTitleElement.addEventListener("keypress", function () {
    workspaceTitle = workspaceTitleElement.value;
    localStorage.setItem("workspaceTitle", workspaceTitle);
    workspaceTitleElement.placeholder = workspaceTitle;
  });
  // set toggle
  document
    .getElementById("channelToggle")
    .addEventListener("click", switchChannels);
  // get ol id funcList
  var funcList = document.getElementById("funcList");
  // set event listener each li
  for (let i = 0; i < funcList.children.length; i++) {
    funcList.children[i].addEventListener("click", function () {
      window.location.href = funcList.children[i].children[0].href;
    });
  }
  // check url is search
  if (window.location.href.indexOf("search?q=") != -1) {
    document.getElementById("searchInputForm").value = decodeUrlEncodedString(
      window.location.href.split("search?q=")[1]
    );
  }
};

window.onhashchange = function () {
  document.getElementById("channelTitle").innerText = makeChannelTitle(
    window.location.href
  );
};

// decode URL encoded string
function decodeUrlEncodedString(str) {
  return decodeURIComponent(str.replace(/\+/g, " "));
}

window.addEventListener(
  "click",
  function () {
    if (!isEnable) {
      return;
    }
    setChannelTitle();
    unreadChannelBold();
  },
  false
);

window.addEventListener("popstate", (e) => {
  setChannelTitle();
  unreadChannelBold();
});

function switchChannels() {
  // display none
  isChannelShow = !isChannelShow;
  if (isChannelShow) {
    document.getElementById("channelList").style.display = "block";
    document.getElementById("channelToggle").innerText = "▼ Channels";
  } else {
    document.getElementById("channelList").style.display = "none";
    document.getElementById("channelToggle").innerText = "▶ Channels";
  }
}

function addCss(cssPath) {
  let path = chrome.runtime.getURL(cssPath);
  let link = document.createElement("link");
  link.href = path;
  link.rel = "stylesheet";
  link.type = "text/css";
  document.head.appendChild(link);
}

function unreadChannelBold() {
  // set notification show
  const noti = document.querySelector(
    'a[data-testid="AppTabBar_Notifications_Link"]'
  );
  if (noti == null) {
    // notificationの有無をチェック
    if (localStorage.getItem("noficationFlag") == "true") {
      document.getElementById("notification").style.fontWeight = "700";
    }
    return;
  }
  const ariaLabel = noti.getAttribute("aria-label");
  try {
    // 未読か確認
    if (ariaLabel.indexOf("未") != -1 || ariaLabel.indexOf("unread") != -1) {
      document.getElementById("notification").style.fontWeight = "700";
    } else {
      document.getElementById("notification").style.fontWeight = "400";
    }
  } catch (e) {
    console.log(e);
  }
}
