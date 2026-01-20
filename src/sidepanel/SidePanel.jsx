import { useState } from "react";

function SidePanel() {
  const [status, setStatus] = useState("Idle");
  const [text, setText] = useState("");

  const extractText = async () => {
    setStatus("Capturing ONLY video area...");
    setText("");

    try {
      // ✅ request cropped (video-only) screenshot from background
      const res = await new Promise((resolve) => {
        chrome.runtime.sendMessage({ type: "CAPTURE_VIDEO_ONLY" }, resolve);
      });

      if (!res || res.error) {
        setStatus("Capture failed ❌");
        setText(res?.error || "");
        return;
      }

      setStatus("Sending to backend OCR...");

      const response = await fetch("http://127.0.0.1:8000/frame", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: res.image })
      });

      const data = await response.json();

      if (data.status === "success") {
        setText(data.text || "");
        setStatus("Text extracted ✅ (video only)");
      } else {
        setStatus("OCR failed ❌");
        setText(data.error || "Unknown error");
      }
    } catch (err) {
      console.error(err);
      setStatus("Backend request failed ❌");
    }
  };

  return (
    <div style={{ padding: 16, fontFamily: "Arial" }}>
      <h3>YT Video OCR</h3>

      <button
        onClick={extractText}
        style={{
          padding: "8px 12px",
          cursor: "pointer",
          borderRadius: 6,
          border: "none",
          background: "black",
          color: "white",
          width: "100%"
        }}
      >
        Extract Text (Video Only)
      </button>

      <p style={{ marginTop: 10 }}>
        <b>Status:</b> {status}
      </p>

      <div
        style={{
          marginTop: 10,
          padding: 10,
          border: "1px solid #ccc",
          borderRadius: 6,
          minHeight: 160,
          whiteSpace: "pre-wrap",
          background: "#f9f9f9"
        }}
      >
        {text || "Video OCR text will appear here..."}
      </div>
    </div>
  );
}

export default SidePanel;