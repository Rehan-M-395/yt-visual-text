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

let lastPausedTime = null;

const video = document.querySelector("video");

if (video) {
    video.addEventListener("pause", () => {
        // avoid duplicate triggers
        if (video.currentTime === lastPausedTime) return;
        lastPausedTime = video.currentTime;

        chrome.runtime.sendMessage({ type: "VIDEO_PAUSED" });
    });
}
