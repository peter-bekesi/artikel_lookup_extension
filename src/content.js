(async () => {
    const response = await fetch(chrome.runtime.getURL('dictionary.json'));
    const dict = await response.json();

    let enabled = true; // default

    // Load stored state
    chrome.storage.local.get({enabled: true}, (res) => {
        enabled = res.enabled;
    });

    // Listen for background toggle messages
    chrome.runtime.onMessage.addListener((msg) => {
        if (msg.type === "TOGGLE_POPUP") {
            enabled = msg.enabled;

            // Optional: visual feedback
            const note = document.createElement("div");
            note.innerText = "Dictionary popup " + (enabled ? "ON" : "OFF");
            Object.assign(note.style, {
                position: "fixed",
                bottom: "20px",
                right: "20px",
                background: enabled ? "#4caf50" : "#f44336",
                color: "#fff",
                padding: "6px 10px",
                borderRadius: "6px",
                zIndex: 9999,
            });
            document.body.appendChild(note);
            setTimeout(() => note.remove(), 1500);
        }
    });

    function showPopup(word, x, y) {
        const entry = dict[word];
        if (!entry) return;
        const [article, _plural, isPlural] = entry.split('|');
        let plural = '';
        if (isPlural === 'p') {
            const temp = word;
            word = _plural;
            plural = temp;
        } else {
            plural = _plural;
        }

        const popup = document.createElement('div');
        popup.innerText = `${article} ${word} (die ${plural})`;
        Object.assign(popup.style, {
            position: 'fixed',
            top: `${y + 10}px`,
            left: `${x + 10}px`,
            background: '#222',
            color: '#fff',
            padding: '6px 10px',
            borderRadius: '6px',
            fontSize: '14px',
            zIndex: 9999
        });

        document.body.appendChild(popup);
        setTimeout(() => popup.remove(), 3000);
    }

    document.addEventListener('dblclick', (event) => {
        if (!enabled) return;
        const selection = window.getSelection().toString().trim();
        if (!selection || selection.length < 2) return;
        const word = selection.charAt(0).toUpperCase() + selection.slice(1);
        showPopup(word, event.clientX, event.clientY);
    });

    document.addEventListener('mouseup', (event) => {
        if (!enabled) return;
        const selection = window.getSelection().toString().trim();
        if (!selection) return;
        // Only one word, no whitespace inside
        if (!/\s/.test(selection)) {
            const word = selection.charAt(0).toUpperCase() + selection.slice(1);
            showPopup(word, event.clientX, event.clientY);
        }
    });
})();

