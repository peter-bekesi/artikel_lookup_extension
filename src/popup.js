document.addEventListener("DOMContentLoaded", () => {
    const button = document.getElementById("toggle");

    // Load current state
    chrome.storage.local.get({ enabled: true }, ({ enabled }) => {
        updateButton(enabled);
    });

    button.addEventListener("click", async () => {
        const { enabled } = await chrome.storage.local.get({ enabled: true });
        const newState = !enabled;
        await chrome.storage.local.set({ enabled: newState });
        updateButton(newState);

        // Send message to active tab so content script updates immediately
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    type: "TOGGLE_POPUP",
                    enabled: newState,
                });
            }
        });
    });

    function updateButton(enabled) {
        button.textContent = enabled ? "Disable Popups" : "Enable Popups";
        button.classList.toggle("off", !enabled);
    }
});