import { useEffect, useState } from "react";
import Tesseract from "tesseract.js";

function SidePanel() {
  const [text, setText] = useState("Pause a YouTube video to extract text");
  const [loading, setLoading] = useState(false);

  const extractFrameText = () => {
    setLoading(true);
    setText("Extracting text...");

    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (!tab?.id) return;

      chrome.tabs.sendMessage(
        tab.id,
        { type: "EXTRACT_FRAME_TEXT" },
        async (res) => {
          try {
            const worker = await Tesseract.createWorker({
              logger: (m) => console.log("[OCR]", m.status),
            });

            await worker.loadLanguage("eng");
            await worker.initialize("eng");

            const {
              data: { text },
            } = await worker.recognize(res.image);

            await worker.terminate();
            setText(text || "No text detected");
          } catch (e) {
            console.error(e);
            setText("OCR failed");
          }

          setLoading(false);
        }
      );
    });
  };

  useEffect(() => {
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.type === "VIDEO_PAUSED") extractFrameText();
    });
  }, []);

  return (
    <div style={{ padding: 12 }}>
      <h3>YT Visual Text</h3>
      {loading && <p>Processing…</p>}
      <pre>{text}</pre>
    </div>
  );
}

export default SidePanel;