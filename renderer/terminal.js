// Wait for DOM and libraries to be ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded');
  console.log('Terminal available:', typeof Terminal);
  console.log('FitAddon available:', typeof FitAddon);
  console.log('window.terminal available:', typeof window.terminal);

  // Check if xterm is loaded
  if (typeof Terminal === 'undefined') {
    console.error('Terminal library not loaded!');
    return;
  }

  if (typeof FitAddon === 'undefined') {
    console.error('FitAddon library not loaded!');
    return;
  }

  if (typeof window.terminal === 'undefined') {
    console.error('Terminal API not exposed from preload!');
    return;
  }

  try {
    // Initialize xterm.js terminal
    const term = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      scrollback: 1000,
      theme: {
        background: '#020617',
        foreground: '#e5e7eb',
        cursor: '#3b82f6',
        cursorAccent: '#020617',
        selectionBackground: '#1e40af66',
        selectionForeground: '#e5e7eb',
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

    console.log('Terminal created');

    // Add fit addon for proper sizing
    const fitAddon = new FitAddon.FitAddon();
    term.loadAddon(fitAddon);

    console.log('FitAddon loaded');

    // Open terminal in the container
    const container = document.getElementById('terminal-container');
    if (!container) {
      console.error('Terminal container not found!');
      return;
    }

    term.open(container);
    console.log('Terminal opened');

    // Fit terminal to container size
    setTimeout(() => {
      fitAddon.fit();
      console.log('Terminal fitted - cols:', term.cols, 'rows:', term.rows);
      window.terminal.resize(term.cols, term.rows);
    }, 100);

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

    function updateTerminalSize() {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        fitAddon.fit();
        window.terminal.resize(term.cols, term.rows);
        console.log('Terminal resized - cols:', term.cols, 'rows:', term.rows);
      }, 50);
    }

    // Watch for size changes on the terminal element
    const terminalElement = document.querySelector('.terminal');
    if (terminalElement) {
      const resizeObserver = new ResizeObserver(() => {
        updateTerminalSize();
      });
      resizeObserver.observe(terminalElement);
    }

    // Also handle window resize
    window.addEventListener('resize', updateTerminalSize);

    console.log('Terminal fully initialized');

  } catch (error) {
    console.error('Error initializing terminal:', error);
  }
});