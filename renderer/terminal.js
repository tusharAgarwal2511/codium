// Initialize xterm.js terminal
const term = new Terminal({
    cursorBlink: true,
    fontSize: 14,
    fontFamily: 'Menlo, Monaco, "Courier New", monospace',
    theme: {
        background: '#020617',
        foreground: '#e5e7eb',
        cursor: '#3b82f6',
        black: '#0f172a',
        red: '#ef4444',
        green: '#22c55e',
        yellow: '#eab308',
        blue: '#3b82f6',
        magenta: '#a855f7',
        cyan: '#06b6d4',
        white: '#e5e7eb',
        brightBlack: '#475569',
        brightRed: '#f87171',
        brightGreen: '#4ade80',
        brightYellow: '#facc15',
        brightBlue: '#60a5fa',
        brightMagenta: '#c084fc',
        brightCyan: '#22d3ee',
        brightWhite: '#f8fafc'
    }
});

// Add fit addon for proper sizing
const fitAddon = new FitAddon.FitAddon();
term.loadAddon(fitAddon);

// Open terminal in the container
term.open(document.getElementById('terminal-container'));

// Fit terminal to container size
fitAddon.fit();

// Handle terminal output from main process
window.terminal.onOutput((data) => {
    term.write(data);
});

// Send user input to main process
term.onData((data) => {
    window.terminal.sendInput(data);
});

// Handle terminal resize
let resizeTimeout;
const terminalElement = document.querySelector('.terminal');
const resizeObserver = new ResizeObserver(() => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        fitAddon.fit();
        // Notify backend of new dimensions
        window.terminal.resize(term.cols, term.rows);
    }, 100);
});

resizeObserver.observe(terminalElement);

// Initial resize notification
setTimeout(() => {
    window.terminal.resize(term.cols, term.rows);
}, 100);