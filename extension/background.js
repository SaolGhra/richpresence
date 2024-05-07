// Logging when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
  console.log("Music Rich Presence installed");
});

// Listening for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "mediaUpdate") {
    const mediaInfo = message.mediaInfo;
    updatePresence(mediaInfo);
  }
});

function updatePresence(mediaInfo) {
  // Here you can format and send the media info to Discord RPC
  // Example:
  const rpc = new RPC.Client({ transport: "ipc" });
  rpc.setActivity({
    details: mediaInfo.title,
    state: mediaInfo.artist,
    startTimestamp: mediaInfo.startTime,
    smallImageKey: "saolghra",
    smallImageText: "SaolGhra - Software Engineer",
    largeImageKey: "nexarda",
    largeImageText: "Discover, Share, and Play!",
    instance: false,
    timestamps: { start: mediaInfo.startTime + mediaInfo.elapsedTime },
  });
  rpc.login({ clientId }).catch(console.error);
}

// Logging when the extension's background script is loaded
console.log("Background script loaded");
