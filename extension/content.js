// content.js

// Sending message to background script when media info is updated
function sendMediaInfoToBackground(mediaInfo) {
  chrome.runtime.sendMessage({ type: "mediaUpdate", mediaInfo: mediaInfo });
}

// Function to extract media information from the page
function extractMediaInfo() {
  // Assuming the title and artist elements have specific IDs or classes
  const titleElement = document.querySelector(".song-title"); // Example selector for the title
  const artistElement = document.querySelector(".artist-name"); // Example selector for the artist

  // If both title and artist elements are found, extract their text content
  if (titleElement && artistElement) {
    const title = titleElement.innerText.trim();
    const artist = artistElement.innerText.trim();
    return { title, artist };
  } else {
    return null; // Return null if either title or artist elements are not found
  }
}

// Function to observe changes in media information on the page
function observeMediaInfoChanges() {
  // Function to handle mutation observer callback
  const mutationCallback = (mutationsList) => {
    // Check each mutation for changes in title or artist elements
    mutationsList.forEach((mutation) => {
      if (mutation.type === "childList") {
        const mediaInfo = extractMediaInfo();
        if (mediaInfo) {
          sendMediaInfoToBackground(mediaInfo);
        }
      }
    });
  };

  // Options for the mutation observer
  const observerConfig = { childList: true, subtree: true };

  // Create a new mutation observer with the callback function and options
  const observer = new MutationObserver(mutationCallback);

  // Start observing changes in the DOM
  observer.observe(document.body, observerConfig);
}

// Call the function to start observing media info changes
observeMediaInfoChanges();
