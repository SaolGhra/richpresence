// Logging when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
  console.log("Music Rich Presence installed");
});

// Listening for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "mediaUpdate") {
    const mediaInfo = message.mediaInfo;
    // Log the media info to check if the URL is provided
    console.log("Received media update:", mediaInfo);
    // Example: You can send the media info to the Discord RPC client
    updatePresence(mediaInfo);

    // Send a response back to the content script
    sendResponse({ status: "ok" });
  }

  // Return true to indicate that you wish to send a response asynchronously
  // This will keep the message channel open until sendResponse is called
  return true;
});

chrome.runtime.getBackgroundPage((backgroundPage) => {
  if (backgroundPage) {
    // The background page is available, send the message
    chrome.runtime.sendMessage({ type: "mediaUpdate", mediaInfo: mediaInfo });
  } else {
    // The background page is not available, handle the error
    console.error("Background page is not available");
  }
});

chrome.runtime.sendMessage(
  { type: "mediaUpdate", mediaInfo: mediaInfo },
  (response) => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError.message);
    } else {
      console.log(response);
    }
  }
);

self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate" && event.request.method === "GET") {
    event.respondWith(
      (async () => {
        const preloadResponse = event.preloadResponse;
        if (preloadResponse) {
          return preloadResponse;
        }

        const response = await fetch(event.request);
        // Ensure that the response is valid before returning it
        if (response && response.status === 200 && response.type === "basic") {
          return response;
        } else {
          // If the response is not valid, return a fallback response
          return new Response("Service Unavailable", { status: 503 });
        }
      })()
    );
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
