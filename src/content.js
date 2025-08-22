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

    function capitalizeFirstLetter(s) {
        if (!s) return s;
        return s.charAt(0).toUpperCase() + s.slice(1);
    }

    function getEntry(word) {
        const entry = dict[word];
        if (entry) return {entry, stub: null};
        for (i = word.length - 1; i > 1; i--) {
            const stub = word.slice(-i);
            const capitalizedStub = capitalizeFirstLetter(stub);
            const entry = dict[capitalizedStub];
            if (entry) return {entry, stub: capitalizedStub};
        }
        return {entry: null, stub: null};
    }

    //TODO case of plural is - in dictionary
    //TODO no lookup if word is non-capitalized? --> only on marking but not on double click?
    //TODO das T, das A etc should be removed
    //TODO not in dictionary but -ung, -schaft, etc.
    //TODO showPopup is run twice on double click? (based on logs)
    //TODO 'Studierende' type of words
    //TODO Dativ -n ending for nouns
    //TODO settable popup time?

    function showPopup(word, x, y) {
        const {entry, stub} = getEntry(word);
        if (!entry) return;
        const [article, _plural, isPlural] = entry.split('|');
        let plural;
        if (isPlural === 'p') {
            if (stub) {
                word = _plural;
                plural = stub;
            } else {
                const temp = word;
                word = _plural;
                plural = temp;
            }
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
        setTimeout(() => popup.remove(), 2000);
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

