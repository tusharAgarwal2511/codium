# Codium

Codium is a desktop code editor built with Electron that combines a file explorer, Monaco-powered editor, and an integrated terminal in a single window. The application is designed for local project browsing and editing, with shell access available from the built-in terminal.

## Features

- Desktop application interface built with Electron
- Left-side file explorer for browsing directories and opening folders
- File operations from the explorer, including creating files and folders, renaming items, deleting items, and refreshing the tree
- Monaco editor with tabbed file handling, syntax-aware editing, theme selection, and font-size controls
- Integrated terminal powered by xterm.js and node-pty for interacting with the host shell
- Resizable layout with draggable splitters for the explorer, editor, and terminal panes
- File-system access through Electron IPC for reading, writing, creating, deleting, and renaming files and folders

## Technology Stack

- Electron for the desktop shell
- Node.js for the main process and IPC handlers
- Monaco Editor for the code editor experience
- xterm.js and xterm-addon-fit for the integrated terminal
- node-pty for spawning a terminal process

## Project Structure

- main.js: Electron main process that creates the window, starts the terminal process, and handles file-system and terminal IPC
- preload.js: exposes safe bridge APIs from the main process to the renderer
- renderer/: renderer-side UI and editor modules
  - index.html: application layout and script loading
  - app.js: editor/tab orchestration and file opening flow
  - file-explorer.js: file tree UI and explorer actions
  - monaco-integration.js: Monaco editor initialization and tab management
  - terminal.js: xterm terminal initialization and terminal input/output handling
  - script.js: draggable resize behavior for the UI panes
  - style.css: application styling
- main.cpp: a simple C++ example program included in the repository

## Getting Started

### Prerequisites

- Node.js and npm

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the application:
   ```bash
   npm start
   ```

### Usage

- Open a folder from the explorer toolbar to begin browsing project files.
- Click a file in the explorer to open it in the editor.
- Use the tabs at the top of the editor to switch between open files.
- Use the terminal pane to run shell commands. The app launches a shell process using PowerShell on Windows and bash on other platforms.

## Development Notes

- The renderer process uses Electron's context isolation and preload bridge rather than direct Node integration.
- File operations are routed through the main process to keep filesystem access centralized.
- The package.json file includes a placeholder test script and no automated test suite is currently configured.

## Notes

This repository currently implements the editor shell and workspace tools described above. The AI helper module exists in the renderer codebase but is not active in the current startup flow.
