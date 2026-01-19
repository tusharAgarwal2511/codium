const { app, BrowserWindow, Menu, ipcMain } = require("electron");
const path = require("path");
const os = require("os");
const pty = require("node-pty");

let ptyProcess = null;

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#000000',
      symbolColor: '#ffffff',
      height: 32   // IMPORTANT
    },
    backgroundColor: "#000000",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js")
    }
  });

  // Maximize window on startup
  win.maximize();

  Menu.setApplicationMenu(null);

  win.loadFile(path.join(__dirname, "renderer/index.html"));

  // Create terminal process
  const shell = os.platform() === "win32" ? "powershell.exe" : "bash";

  ptyProcess = pty.spawn(shell, [], {
    name: "xterm-color",
    cols: 80,
    rows: 24,
    cwd: process.env.HOME || process.env.USERPROFILE,
    env: process.env
  });

  // Send terminal output to renderer
  ptyProcess.onData((data) => {
    win.webContents.send("terminal-output", data);
  });

  // Receive input from renderer
  ipcMain.on("terminal-input", (event, data) => {
    if (ptyProcess) {
      ptyProcess.write(data);
    }
  });

  // Handle terminal resize
  ipcMain.on("terminal-resize", (event, { cols, rows }) => {
    if (ptyProcess) {
      ptyProcess.resize(cols, rows);
    }
  });

  // Cleanup on window close
  win.on("closed", () => {
    if (ptyProcess) {
      ptyProcess.kill();
    }
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("quit", () => {
  if (ptyProcess) {
    ptyProcess.kill();
  }
});