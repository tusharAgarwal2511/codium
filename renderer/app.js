// ========== GLOBAL STATE ==========
const state = {
  currentFolder: null,
  expandedFolders: new Set(),
  openTabs: new Map(),
  activeTab: null,
  editor: null,
  fontSize: 14,
  fontFamily: 'Fira Code',
  theme: 'vs-dark'
};

// ========== INITIALIZE APP ==========
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Starting Codium...');
  
  await initMonaco();
  initEventListeners();
  initEditorSettings();
  
  console.log('✅ Codium ready!');
});

// ========== MONACO EDITOR ==========
async function initMonaco() {
  console.log('📝 Initializing Monaco Editor...');
  
  await new Promise(resolve => {
    if (typeof monaco !== 'undefined') {
      resolve();
    } else {
      const check = setInterval(() => {
        if (typeof monaco !== 'undefined') {
          clearInterval(check);
          resolve();
        }
      }, 100);
    }
  });

  // Create editor
  state.editor = monaco.editor.create(document.getElementById('monaco-editor'), {
    value: '// Welcome to Codium!\n// Open a folder (📂) and click on any file to start editing\n// All programming languages are supported\n// Use the controls at the top to change theme, font, and font size',
    language: 'javascript',
    theme: state.theme,
    automaticLayout: true,
    fontSize: state.fontSize,
    fontFamily: `${state.fontFamily}, Consolas, "Courier New", monospace`,
    minimap: { enabled: true },
    scrollBeyondLastLine: false,
    wordWrap: 'off',
    lineNumbers: 'on',
    renderWhitespace: 'selection',
    bracketPairColorization: { enabled: true }
  });

  // Define custom themes
  monaco.editor.defineTheme('codium-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6A9955' },
      { token: 'keyword', foreground: 'C586C0' },
      { token: 'string', foreground: 'CE9178' },
      { token: 'number', foreground: 'B5CEA8' }
    ],
    colors: {
      'editor.background': '#0B192C',
      'editor.foreground': '#e5e7eb',
      'editor.lineHighlightBackground': '#1a2332',
      'editorCursor.foreground': '#888888',
      'editor.selectionBackground': '#3a3a3a66'
    }
  });

  // Keyboard shortcuts
  state.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, saveCurrentFile);

  console.log('✅ Monaco ready!');
}

// ========== EDITOR SETTINGS ==========
function initEditorSettings() {
  // Theme selector
  const themeSelect = document.getElementById('theme-select');
  themeSelect.value = state.theme;
  themeSelect.addEventListener('change', (e) => {
    state.theme = e.target.value;
    monaco.editor.setTheme(state.theme);
    console.log('Theme changed to:', state.theme);
  });

  // Font selector
  const fontSelect = document.getElementById('font-select');
  fontSelect.value = state.fontFamily;
  fontSelect.addEventListener('change', (e) => {
    state.fontFamily = e.target.value;
    updateEditorFont();
    console.log('Font changed to:', state.fontFamily);
  });

  // Font size controls
  document.getElementById('font-increase').addEventListener('click', () => {
    if (state.fontSize < 30) {
      state.fontSize += 2;
      updateEditorFont();
    }
  });

  document.getElementById('font-decrease').addEventListener('click', () => {
    if (state.fontSize > 8) {
      state.fontSize -= 2;
      updateEditorFont();
    }
  });

  updateFontSizeDisplay();
}

function updateEditorFont() {
  state.editor.updateOptions({
    fontSize: state.fontSize,
    fontFamily: `${state.fontFamily}, Consolas, "Courier New", monospace`
  });
  updateFontSizeDisplay();
  console.log(`Font updated: ${state.fontFamily} ${state.fontSize}px`);
}

function updateFontSizeDisplay() {
  document.getElementById('font-size-display').textContent = state.fontSize;
}

// ========== EVENT LISTENERS ==========
function initEventListeners() {
  // Open folder buttons
  document.getElementById('open-folder-btn').addEventListener('click', openFolder);
  document.getElementById('open-folder-empty')?.addEventListener('click', openFolder);
  
  // New file button
  document.getElementById('new-file-btn').addEventListener('click', () => {
    if (!state.currentFolder) {
      alert('Please open a folder first');
      return;
    }
    createNewFile();
  });
  
  // Refresh button
  document.getElementById('refresh-btn').addEventListener('click', () => {
    if (state.currentFolder) {
      loadFileTree(state.currentFolder);
    }
  });

  // Hide context menu on click
  document.addEventListener('click', () => {
    document.getElementById('context-menu').style.display = 'none';
  });
}

// ========== FOLDER OPERATIONS ==========
async function openFolder() {
  console.log('📂 Opening folder...');
  
  const path = await window.fileSystem.selectFolder();
  if (!path) return;

  state.currentFolder = path;
  const folderName = path.split(/[\\/]/).pop();
  document.getElementById('folder-name').textContent = folderName.toUpperCase();
  
  await loadFileTree(path);
  console.log('✅ Folder opened:', path);
}

async function loadFileTree(path) {
  console.log('🌳 Loading file tree...');
  
  try {
    const items = await window.fileSystem.readDirectory(path);
    const container = document.getElementById('file-tree');
    container.className = 'file-tree-content';
    container.innerHTML = '';
    
    renderTree(items, container, path, 0);
  } catch (error) {
    console.error('❌ Error loading tree:', error);
    alert('Error loading folder: ' + error.message);
  }
}

function renderTree(items, container, basePath, level) {
  items.forEach(item => {
    const separator = basePath.includes('\\') ? '\\' : '/';
    const fullPath = basePath.endsWith(separator) 
      ? basePath + item.name 
      : basePath + separator + item.name;
    
    // Create tree item
    const div = document.createElement('div');
    div.className = 'tree-item';
    div.style.paddingLeft = (level * 16 + 8) + 'px';
    div.dataset.path = fullPath;
    div.dataset.isDir = item.isDirectory;

    // Arrow for folders
    const arrow = document.createElement('span');
    arrow.className = 'tree-arrow';
    if (item.isDirectory) {
      arrow.textContent = state.expandedFolders.has(fullPath) ? '▼' : '▶';
      arrow.onclick = (e) => {
        e.stopPropagation();
        toggleFolder(fullPath);
      };
    }
    div.appendChild(arrow);

    // Icon
    const icon = document.createElement('span');
    icon.className = 'tree-icon';
    icon.textContent = getFileIcon(item.name, item.isDirectory);
    div.appendChild(icon);

    // Label
    const label = document.createElement('span');
    label.className = 'tree-label';
    label.textContent = item.name;
    div.appendChild(label);

    // Click handler
    div.onclick = () => {
      document.querySelectorAll('.tree-item').forEach(el => el.classList.remove('selected'));
      div.classList.add('selected');
      
      if (!item.isDirectory) {
        openFile(fullPath);
      }
    };

    // Context menu
    div.oncontextmenu = (e) => {
      e.preventDefault();
      showContextMenu(e, fullPath, item.isDirectory);
    };

    container.appendChild(div);

    // Render children if expanded
    if (item.isDirectory && state.expandedFolders.has(fullPath) && item.children) {
      renderTree(item.children, container, basePath, level + 1);
    }
  });
}

function toggleFolder(path) {
  if (state.expandedFolders.has(path)) {
    state.expandedFolders.delete(path);
  } else {
    state.expandedFolders.add(path);
  }
  loadFileTree(state.currentFolder);
}

// ========== FILE OPERATIONS ==========
async function openFile(path) {
  console.log('📄 Opening file:', path);

  // If already open, just switch to it
  if (state.openTabs.has(path)) {
    switchToTab(path);
    return;
  }

  try {
    const content = await window.fileSystem.readFile(path);
    const language = detectLanguage(path);
    
    // Create Monaco model
    const model = monaco.editor.createModel(content, language);
    
    // Store tab
    state.openTabs.set(path, {
      model: model,
      viewState: null,
      modified: false
    });

    // Listen for changes
    model.onDidChangeContent(() => {
      const tab = state.openTabs.get(path);
      if (tab) {
        tab.modified = true;
        updateTabUI(path);
      }
    });

    // Create tab UI
    createTab(path);
    
    // Switch to tab
    switchToTab(path);
    
    console.log('✅ File opened:', path);
  } catch (error) {
    console.error('❌ Error opening file:', error);
    alert('Error opening file: ' + error.message);
  }
}

function createTab(path) {
  const container = document.getElementById('tabs-container');
  const fileName = path.split(/[\\/]/).pop();
  
  const tab = document.createElement('div');
  tab.className = 'tab';
  tab.dataset.path = path;

  const icon = document.createElement('span');
  icon.className = 'tab-icon';
  icon.textContent = getFileIcon(fileName, false);
  tab.appendChild(icon);

  const label = document.createElement('span');
  label.className = 'tab-label';
  label.textContent = fileName;
  tab.appendChild(label);

  const modified = document.createElement('span');
  modified.className = 'tab-modified';
  modified.style.display = 'none';
  modified.textContent = '●';
  tab.appendChild(modified);

  const close = document.createElement('span');
  close.className = 'tab-close';
  close.textContent = '×';
  close.onclick = (e) => {
    e.stopPropagation();
    closeTab(path);
  };
  tab.appendChild(close);

  tab.onclick = () => switchToTab(path);

  container.appendChild(tab);
}

function switchToTab(path) {
  // Save current view state
  if (state.activeTab && state.openTabs.has(state.activeTab)) {
    state.openTabs.get(state.activeTab).viewState = state.editor.saveViewState();
  }

  // Switch to new tab
  state.activeTab = path;
  const tab = state.openTabs.get(path);
  
  if (tab) {
    state.editor.setModel(tab.model);
    
    if (tab.viewState) {
      state.editor.restoreViewState(tab.viewState);
    }

    // Update UI
    document.querySelectorAll('.tab').forEach(el => {
      el.classList.toggle('active', el.dataset.path === path);
    });

    state.editor.focus();
  }
}

async function closeTab(path) {
  const tab = state.openTabs.get(path);
  
  if (tab && tab.modified) {
    const save = confirm(`${path.split(/[\\/]/).pop()} has unsaved changes. Save?`);
    if (save) {
      await saveFile(path);
    }
  }

  // Dispose model
  if (tab) tab.model.dispose();
  
  // Remove from state
  state.openTabs.delete(path);
  
  // Remove tab element
  const tabEl = document.querySelector(`.tab[data-path="${CSS.escape(path)}"]`);
  if (tabEl) tabEl.remove();

  // Switch to another tab or welcome screen
  if (state.activeTab === path) {
    const remaining = Array.from(state.openTabs.keys());
    if (remaining.length > 0) {
      switchToTab(remaining[0]);
    } else {
      state.activeTab = null;
      const welcome = monaco.editor.createModel(
        '// Welcome to Codium!\n// Open a folder (📂) and click on any file to start editing\n// All programming languages are supported\n// Use the controls at the top to change theme, font, and font size',
        'javascript'
      );
      state.editor.setModel(welcome);
    }
  }
}

async function saveFile(path) {
  const tab = state.openTabs.get(path);
  if (!tab) return;

  try {
    const content = tab.model.getValue();
    await window.fileSystem.writeFile(path, content);
    
    tab.modified = false;
    updateTabUI(path);
    
    console.log('💾 File saved:', path);
    showNotification('File saved!');
  } catch (error) {
    console.error('❌ Error saving:', error);
    alert('Error saving file: ' + error.message);
  }
}

async function saveCurrentFile() {
  if (state.activeTab) {
    await saveFile(state.activeTab);
  }
}

function updateTabUI(path) {
  const tabEl = document.querySelector(`.tab[data-path="${CSS.escape(path)}"]`);
  const tab = state.openTabs.get(path);
  
  if (tabEl && tab) {
    const modified = tabEl.querySelector('.tab-modified');
    modified.style.display = tab.modified ? 'inline' : 'none';
  }
}

// ========== UTILITIES ==========
function detectLanguage(path) {
  const ext = path.split('.').pop().toLowerCase();
  const map = {
    js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript',
    py: 'python', java: 'java', cpp: 'cpp', c: 'c', cs: 'csharp',
    html: 'html', css: 'css', scss: 'scss', json: 'json',
    md: 'markdown', xml: 'xml', yaml: 'yaml', yml: 'yaml',
    sh: 'shell', sql: 'sql', php: 'php', rb: 'ruby',
    go: 'go', rs: 'rust', swift: 'swift', kt: 'kotlin'
  };
  return map[ext] || 'plaintext';
}

function getFileIcon(name, isDir) {
  if (isDir) return '📁';
  
  const ext = name.split('.').pop().toLowerCase();
  const icons = {
    js: '🟨', jsx: '⚛️', ts: '🔷', tsx: '⚛️',
    py: '🐍', java: '☕', cpp: '⚙️', c: '⚙️',
    html: '🌐', css: '🎨', json: '📋', md: '📝',
    png: '🖼️', jpg: '🖼️', gif: '🖼️', svg: '🖼️'
  };
  return icons[ext] || '📄';
}

async function createNewFile() {
  const name = prompt('Enter file name:');
  if (!name) return;

  const separator = state.currentFolder.includes('\\') ? '\\' : '/';
  const path = state.currentFolder.endsWith(separator)
    ? state.currentFolder + name
    : state.currentFolder + separator + name;
  
  try {
    await window.fileSystem.writeFile(path, '');
    await loadFileTree(state.currentFolder);
    await openFile(path);
    console.log('✅ File created:', path);
  } catch (error) {
    console.error('❌ Error creating file:', error);
    alert('Error creating file: ' + error.message);
  }
}

function showContextMenu(e, path, isDir) {
  const menu = document.getElementById('context-menu');
  menu.style.display = 'block';
  menu.style.left = e.pageX + 'px';
  menu.style.top = e.pageY + 'px';

  menu.onclick = async (event) => {
    const action = event.target.dataset.action;
    if (!action) return;

    menu.style.display = 'none';

    if (action === 'new-file') {
      await createNewFile();
    } else if (action === 'rename') {
      const newName = prompt('New name:', path.split(/[\\/]/).pop());
      if (newName) {
        const separator = path.includes('\\') ? '\\' : '/';
        const newPath = path.substring(0, path.lastIndexOf(separator)) + separator + newName;
        await window.fileSystem.renameItem(path, newPath);
        await loadFileTree(state.currentFolder);
      }
    } else if (action === 'delete') {
      if (confirm('Delete ' + path + '?')) {
        await window.fileSystem.deleteItem(path);
        await loadFileTree(state.currentFolder);
      }
    }
  };
}

function showNotification(message) {
  const notif = document.createElement('div');
  notif.textContent = message;
  notif.style.cssText = `
    position: fixed; bottom: 30px; right: 30px;
    background: #22c55e; color: white;
    padding: 10px 20px; border-radius: 6px;
    font-size: 13px; z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(notif);
  setTimeout(() => notif.remove(), 2000);
}