chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GET_VIDEO_RECT") {
    const video = document.querySelector("video");

    if (!video) {
      sendResponse({ error: "Video element not found" });
      return;
    }

    const rect = video.getBoundingClientRect();

    sendResponse({
      rect: {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        devicePixelRatio: window.devicePixelRatio || 1
      }
    });
  }
});