chrome.action.onClicked.addListener(async (tab) => {
  if (!tab?.id) return;
  await chrome.sidePanel.open({ tabId: tab.id });
});

// Helper: crop base64 image using OffscreenCanvas
async function cropImage(dataUrl, crop) {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const bitmap = await createImageBitmap(blob);

  const canvas = new OffscreenCanvas(crop.width, crop.height);
  const ctx = canvas.getContext("2d");

  ctx.drawImage(
    bitmap,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    crop.width,
    crop.height
  );

  const outBlob = await canvas.convertToBlob({ type: "image/png" });

  return await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(outBlob);
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "CAPTURE_VIDEO_ONLY") {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (!tab?.id) {
        sendResponse({ error: "No active tab" });
        return;
      }

      // ✅ Step 1: Ask content script for video rect
      chrome.tabs.sendMessage(tab.id, { type: "GET_VIDEO_RECT" }, async (rectRes) => {
        if (!rectRes || rectRes.error) {
          sendResponse({ error: rectRes?.error || "Failed to get video rect" });
          return;
        }

        // ✅ Step 2: Capture full screenshot
        chrome.tabs.captureVisibleTab(null, { format: "png" }, async (dataUrl) => {
          if (chrome.runtime.lastError) {
            sendResponse({ error: chrome.runtime.lastError.message });
            return;
          }

          try {
            const { x, y, width, height, devicePixelRatio } = rectRes.rect;

            // Convert CSS pixels -> real screenshot pixels
            const crop = {
              x: Math.max(0, Math.floor(x * devicePixelRatio)),
              y: Math.max(0, Math.floor(y * devicePixelRatio)),
              width: Math.floor(width * devicePixelRatio),
              height: Math.floor(height * devicePixelRatio)
            };

            // ✅ Step 3: Crop screenshot to ONLY video
            const croppedDataUrl = await cropImage(dataUrl, crop);

            sendResponse({ image: croppedDataUrl });
          } catch (e) {
            sendResponse({ error: String(e) });
          }
        });
      });
    });

    return true; // ✅ important
  }
});