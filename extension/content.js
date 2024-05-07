// content.js

// Function to send media info to the background script
function sendMediaInfoToBackground(mediaInfo) {
  if (chrome && chrome.runtime) {
    chrome.runtime.sendMessage(
      { type: "mediaUpdate", mediaInfo: mediaInfo },
      function (response) {
        if (chrome.runtime.lastError) {
          console.error(
            "Error sending message:",
            chrome.runtime.lastError.message
          );
        }
      }
    );
  } else {
    console.error("Chrome runtime is not available.");
  }
}

// Function to extract media information from the page
function extractMediaInfo() {
  const playerBar = document.querySelector("ytmusic-player-bar");
  if (!playerBar) return null;

  const outer = playerBar.querySelector(
    "yt-formatted-string.byline.ytmusic-player-bar.complex-string"
  );
  if (!outer) return null;

  const thumbnail = playerBar.querySelector("img.ytmusic-player-bar").src;
  const title = playerBar.querySelector(
    "yt-formatted-string.title.ytmusic-player-bar"
  ).innerHTML;

  const items = outer.querySelectorAll(
    "a.yt-simple-endpoint.yt-formatted-string"
  );
  const artist = items.item(0).innerHTML;
  const album = items.item(1).innerHTML;

  const leftControls = playerBar.querySelector(".left-controls");
  const playPauseButton = leftControls.querySelector("#play-pause-button");
  const isPlaying = playPauseButton.getAttribute("aria-label") === "Pause";

  const [elapsed, total] = leftControls
    .querySelector("span.time-info.ytmusic-player-bar")
    .innerHTML.trim()
    .split(" / ");

  const listItem = document.querySelector(
    `ytmusic-responsive-list-item-renderer.ytmusic-playlist-shelf-renderer[play-button-state="playing"], 
       ytmusic-responsive-list-item-renderer.ytmusic-playlist-shelf-renderer[play-button-state="paused"]`
  );

  let url;

  if (listItem) {
    const el = listItem.querySelector(
      "yt-formatted-string.title.ytmusic-responsive-list-item-renderer"
    );
    if (el) {
      const a = el.querySelector("a");
      if (a) {
        url = a.href;
      }
    }
  }

  return {
    thumbnail,
    title,
    artist,
    album,
    isPlaying,
    elapsed: timestampToSeconds(elapsed),
    total: timestampToSeconds(total),
    url,
  };
}

function timestampToSeconds(timestamp) {
  const parts = timestamp.split(":");
  let seconds = 0;
  let multiplier = 1;

  while (parts.length > 0) {
    seconds += multiplier * parseInt(parts.pop(), 10);
    multiplier *= 60;
  }

  return seconds;
}

// Function to compare activity objects
function compareActivity(a, b) {
  if (a.isPlaying !== b.isPlaying) return false;
  else if (a.thumbnail !== b.thumbnail) return false;
  else if (a.url !== b.url) return false;
  else if (a.title !== b.title) return false;
  else if (a.artist !== b.artist) return false;
  else if (a.album !== b.album) return false;
  else return true;
}

let lastActivity = null;

// Function to update Discord RPC presence
function updatePresence() {
  const activity = extractMediaInfo();
  if (!activity) {
    // If there's no activity, clear the presence
    sendMediaInfoToBackground(null);
    return;
  }

  // If the activity is the same as the last one, no need to update
  if (lastActivity && compareActivity(lastActivity, activity)) {
    return;
  }

  // Send the new activity to the background script
  sendMediaInfoToBackground(transformMusicActivity(activity));

  // Update lastActivity
  lastActivity = activity;
}

// Function to transform activity data
function transformMusicActivity(data) {
  return {
    details: data.title,
    state: data.artist,
    largeImageKey: data.thumbnail,
    largeImageText: data.album,
    smallImageKey: "icon",
    smallImageText: data.isPlaying ? "Playing" : "Paused",
    buttons: data.url
      ? [{ label: "Listen on YouTube Music", url: data.url }]
      : undefined,
  };
}

// Start observing changes in the player bar
const playerBar = document.querySelector("ytmusic-player-bar");
if (playerBar) {
  const observer = new MutationObserver(updatePresence);
  observer.observe(playerBar, {
    childList: true,
    subtree: true,
    attributes: true,
  });
}

setInterval(function () {
  const mediaInfo = extractMediaInfo();
  if (mediaInfo) {
    sendMediaInfoToBackground(mediaInfo);
  }
}, 5000);

// Initial update of presence
updatePresence();
