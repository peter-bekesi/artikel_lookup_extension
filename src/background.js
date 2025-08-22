chrome.commands.onCommand.addListener(async (command) => {
    if (command === "toggle-extension") {
        const { enabled } = await chrome.storage.local.get({ enabled: true });
        const newState = !enabled;

        await chrome.storage.local.set({ enabled: newState });

        console.log("Dictionary popup toggled:", newState ? "ON" : "OFF");

        // Optional: small feedback in the active tab
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    type: "TOGGLE_POPUP",
                    enabled: newState,
                });
            }
            /*chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                func: (enabled) => {
                    console.log("Dictionary popup is now", enabled ? "ON" : "OFF");
                },
                args: [newState]
            });*/
        });
    }
});