chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === "CAPTURE_FRAME") {
      const video = document.querySelector("video");
  
      if (!video) {
        sendResponse({ error: "No video found" });
        return;
      }
  
      if (!video.paused) {
        video.pause();
      }
  
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
  
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0);
  
      const image = canvas.toDataURL("image/png");
      sendResponse({ image });
  
      return true;
    }
  });  