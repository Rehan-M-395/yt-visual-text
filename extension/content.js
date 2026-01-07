chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type !== "EXTRACT_FRAME_TEXT") return;

    const video = document.querySelector("video");
    if (!video) {
        sendResponse({ error: "Video not found" });
        return;
    }

    if (!video.paused) {
        sendResponse({ error: "Pause the video first" });
        return;
    }

    // Create canvas
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 🔥 IMAGE PREPROCESSING STARTS HERE
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // 1️⃣ Grayscale
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;

        // 2️⃣ Threshold (black & white)
        const value = gray > 150 ? 255 : 0;

        data[i] = value;     // R
        data[i + 1] = value; // G
        data[i + 2] = value; // B
    }

    ctx.putImageData(imageData, 0, 0);
    // 🔥 IMAGE PREPROCESSING ENDS HERE

    const processedImage = canvas.toDataURL("image/png");
    sendResponse({ image: processedImage });
});

console.log("[YT Visual Text] content.js loaded");

let lastPausedTime = null;
let currentVideo = null;

function attachPauseListener(video) {
    if (video === currentVideo) return; // already attached
    currentVideo = video;

    console.log("[YT Visual Text] Attaching pause listener");

    video.addEventListener("pause", () => {
        console.log("[YT Visual Text] Video paused");

        if (video.currentTime === lastPausedTime) return;
        lastPausedTime = video.currentTime;

        try {
            chrome.runtime.sendMessage({ type: "VIDEO_PAUSED" });
        } catch (e) {
            console.warn("[YT Visual Text] Extension context invalidated");
        }
    });
}

// Observe DOM changes
const observer = new MutationObserver(() => {
    const video = document.querySelector("video");
    if (video) attachPauseListener(video);
});

// Start observing
observer.observe(document.body, {
    childList: true,
    subtree: true
});