import React from "react";
import ReactDOM from "react-dom/client";
import Popup from "./Popup";
import "./popup.css";

const rootEl = document.getElementById("root");

console.log("ROOT ELEMENT:", rootEl);

ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
        <Popup />
    </React.StrictMode>
);
