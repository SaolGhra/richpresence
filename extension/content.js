// content.js

// Function to extract media information from the page
function extractMediaInfo() {
  const titleElement = document.querySelector(".title");
  const artistElement = document.querySelector(".artist");

  if (titleElement && artistElement) {
    const title = titleElement.textContent.trim();
    const artist = artistElement.textContent.trim();

    // Send the media info to the background script
    try {
      chrome.runtime.sendMessage({
        type: "mediaUpdate",
        mediaInfo: { title, artist },
      });
    } catch (error) {
      console.error("Error sending media update to background script:", error);
    }
  }
}

// Run the extraction function initially
extractMediaInfo();

// Run the extraction function every 3 seconds
setInterval(extractMediaInfo, 3000);
