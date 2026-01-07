function Popup() {
    const openSidePanel = () => {
        chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
            if (tab?.id) {
                chrome.sidePanel.open({ tabId: tab.id });
                window.close();
            }
        });
    };

    return (
        <div className="popup">
            <h3>YT Visual Text</h3>
            <button onClick={openSidePanel}>📺 Open Side Panel</button>
        </div>
    );
}

export default Popup;
