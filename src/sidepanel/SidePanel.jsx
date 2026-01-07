import { useEffect, useState } from "react";
import Tesseract from "tesseract.js";

function SidePanel() {
    const [text, setText] = useState("Pause a YouTube video to extract text");
    const [loading, setLoading] = useState(false);

    // 🔹 Runs OCR after getting frame image
    const extractFrameText = () => {
        console.log("[SidePanel] Requesting frame from content.js");

        setLoading(true);
        setText("Extracting text from frame...");

        chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
            if (!tab?.id) {
                setText("No active tab found");
                setLoading(false);
                return;
            }

            chrome.tabs.sendMessage(
                tab.id,
                { type: "EXTRACT_FRAME_TEXT" },
                async (res) => {
                    if (!res || res.error) {
                        console.warn("[SidePanel] Frame error", res?.error);
                        setText(res?.error || "No response from content script");
                        setLoading(false);
                        return;
                    }

                    console.log("[SidePanel] Frame received, running OCR");

                    try {
                        const { data } = await Tesseract.recognize(
                            res.image,
                            "eng",
                            {
                                logger: (m) => console.log("[OCR]", m.status)
                            }
                        );

                        setText(data.text?.trim() || "No text detected");
                    } catch (err) {
                        console.error("[SidePanel] OCR failed", err);
                        setText("OCR failed");
                    }

                    setLoading(false);
                }
            );
        });
    };

    // 🔹 Listen for VIDEO_PAUSED message
    useEffect(() => {
        console.log("[SidePanel] Loaded and listening for messages");

        const listener = (msg) => {
            console.log("[SidePanel] Message received:", msg);

            if (msg.type === "VIDEO_PAUSED") {
                extractFrameText();
            }
        };

        chrome.runtime.onMessage.addListener(listener);
        return () => chrome.runtime.onMessage.removeListener(listener);
    }, []);

    return (
        <div
            style={{
                padding: "12px",
                fontFamily: "Arial, sans-serif",
                fontSize: "13px"
            }}
        >
            <h3>YT Visual Text</h3>

            {loading && <p>Processing…</p>}

            <pre
                style={{
                    whiteSpace: "pre-wrap",
                    background: "#f4f4f4",
                    padding: "8px",
                    borderRadius: "4px",
                    maxHeight: "70vh",
                    overflowY: "auto"
                }}
            >
                {text}
            </pre>
        </div>
    );
}

export default SidePanel;