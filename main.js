const { app, BrowserWindow, Menu, ipcMain, dialog } = require("electron");
const path = require("path");
const os = require("os");
const fs = require("fs").promises;
const pty = require("node-pty");

let ptyProcess = null;
let mainWindow = null;

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#000000',
      symbolColor: '#ffffff',
      height: 32
    },
    backgroundColor: "#000000",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js")
    }
  });

  mainWindow = win;
  win.maximize();
  Menu.setApplicationMenu(null);

  win.loadFile(path.join(__dirname, "renderer/index.html"));

  // Terminal setup
  const shell = os.platform() === "win32" ? "powershell.exe" : "bash";
  const homeDir = process.env.HOME || process.env.USERPROFILE;

  ptyProcess = pty.spawn(shell, [], {
    name: "xterm-color",
    cols: 80,
    rows: 24,
    cwd: homeDir,
    env: process.env
  });

  ptyProcess.onData((data) => win.webContents.send("terminal-output", data));

  ipcMain.on("terminal-input", (event, data) => {
    if (ptyProcess) ptyProcess.write(data);
  });

  ipcMain.on("terminal-resize", (event, { cols, rows }) => {
    if (ptyProcess) ptyProcess.resize(cols, rows);
  });

  win.on("closed", () => {
    if (ptyProcess) ptyProcess.kill();
  });
}

// ========== FILE SYSTEM HANDLERS ==========

ipcMain.handle("fs-select-folder", async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle("fs-read-directory", async (event, dirPath) => {
  const items = await fs.readdir(dirPath, { withFileTypes: true });

  const result = await Promise.all(
    items.map(async (item) => {
      const itemPath = path.join(dirPath, item.name);
      const isDirectory = item.isDirectory();

      let children = null;
      if (isDirectory) {
        try {
          const subItems = await fs.readdir(itemPath, { withFileTypes: true });
          children = subItems.map(sub => ({
            name: sub.name,
            isDirectory: sub.isDirectory()
          }));
          children.sort((a, b) => {
            if (a.isDirectory === b.isDirectory) return a.name.localeCompare(b.name);
            return a.isDirectory ? -1 : 1;
          });
        } catch (err) {
          children = [];
        }
      }

      return { name: item.name, isDirectory, children };
    })
  );

  result.sort((a, b) => {
    if (a.isDirectory === b.isDirectory) return a.name.localeCompare(b.name);
    return a.isDirectory ? -1 : 1;
  });

  return result;
});

ipcMain.handle("fs-read-file", async (event, filePath) => {
  return await fs.readFile(filePath, "utf-8");
});

ipcMain.handle("fs-write-file", async (event, filePath, content) => {
  await fs.writeFile(filePath, content, "utf-8");
  return { success: true };
});

ipcMain.handle("fs-create-directory", async (event, dirPath) => {
  await fs.mkdir(dirPath, { recursive: true });
  return { success: true };
});

ipcMain.handle("fs-delete-item", async (event, itemPath) => {
  const stats = await fs.stat(itemPath);
  if (stats.isDirectory()) {
    await fs.rm(itemPath, { recursive: true, force: true });
  } else {
    await fs.unlink(itemPath);
  }
  return { success: true };
});

ipcMain.handle("fs-rename-item", async (event, oldPath, newPath) => {
  await fs.rename(oldPath, newPath);
  return { success: true };
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("quit", () => {
  if (ptyProcess) ptyProcess.kill();
});