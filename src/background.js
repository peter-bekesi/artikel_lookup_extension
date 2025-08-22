chrome.commands.onCommand.addListener(async (command) => {
    if (command === "toggle-extension") {
        const { enabled } = await chrome.storage.local.get({ enabled: true });
        const newState = !enabled;

        await chrome.storage.local.set({ enabled: newState });

        console.log("Dictionary popup toggled:", newState ? "ON" : "OFF");

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (!tabs[0]) return;
            chrome.tabs.sendMessage(tabs[0].id, {
                type: "TOGGLE_POPUP",
                enabled: newState
            }, (_) => {
                if (chrome.runtime.lastError) {
                    // harmless on pages without content script
                    console.log("No content script in this tab:", chrome.runtime.lastError.message);
                }
            });
        });
    }
});