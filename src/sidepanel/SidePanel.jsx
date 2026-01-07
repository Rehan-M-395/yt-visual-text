import { useEffect, useState } from "react";
import Tesseract from "tesseract.js";

function SidePanel() {
    const [text, setText] = useState("Pause video to extract text...");

    useEffect(() => {
        chrome.runtime.onMessage.addListener((msg) => {
            if (msg.type === "VIDEO_PAUSED") {
                extractText();
            }
        });
    }, []);

    const extractText = () => {
        chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
            chrome.tabs.sendMessage(
                tab.id,
                { type: "EXTRACT_FRAME_TEXT" },
                async (res) => {
                    if (!res?.image) return;

                    const { data } = await Tesseract.recognize(res.image, "eng");
                    setText(data.text || "No text detected");
                }
            );
        });
    };

    return (
        <div className="panel">
            <h3>Auto OCR</h3>
            <pre>{text}</pre>
        </div>
    );
}

export default SidePanel;
