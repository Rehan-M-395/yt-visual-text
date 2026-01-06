function Popup() {
    const openSidePanel = async () => {
        const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true
        });

        if (tab?.id) {
            chrome.sidePanel.open({ tabId: tab.id });
        }
    };

    return (
        <div className="popup">
            <h3>YT Visual Text</h3>
            <button onClick={openSidePanel}>
                Open Side Panel
            </button>
        </div>
    );
}

export default Popup;
