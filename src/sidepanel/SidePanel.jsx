import { useState } from "react";

function SidePanel() {
  const [status, setStatus] = useState("Idle");

  const extractText = () => {
    setStatus("Capturing frame...");

    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (!tab?.id) {
        setStatus("No active tab");
        return;
      }

      chrome.tabs.sendMessage(
        tab.id,
        { type: "CAPTURE_FRAME" },
        async (res) => {
          if (!res || res.error) {
            console.error(res?.error);
            setStatus("Failed to capture frame");
            return;
          }

          setStatus("Sending image to backend...");

          try {
            const response = await fetch("http://127.0.0.1:8000/frame", {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({ image: res.image })
            });

            const data = await response.json();
            console.log("Backend response:", data);

            setStatus("Image sent to backend ✅");
          } catch (err) {
            console.error(err);
            setStatus("Backend request failed ❌");
          }
        }
      );
    });
  };

  return (
    <div style={{ padding: "16px", fontFamily: "Arial" }}>
      <h3>YT Visual Text</h3>

      <button
        onClick={extractText}
        style={{ padding: "8px 12px", cursor: "pointer" }}
      >
        Extract Text
      </button>

      <p style={{ marginTop: "10px" }}>
        <strong>Status:</strong> {status}
      </p>
    </div>
  );
}

export default SidePanel;
