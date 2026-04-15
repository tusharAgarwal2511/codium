// // ========== GLOBAL STATE ==========
// const state = {
//   currentFolder: null,
//   expandedFolders: new Set(),
//   openTabs: new Map(),
//   activeTab: null,
//   editor: null,
//   fontSize: 14,
//   fontFamily: 'Fira Code',
//   theme: 'vs-dark'
// };

// // ========== INITIALIZE APP ==========
// document.addEventListener('DOMContentLoaded', async () => {
//   console.log('🚀 Starting Codium...');

//   await initMonaco();
//   await initEventListeners();
//   initEditorSettings();
//   createInputModal();

//   console.log('✅ Codium ready!');
// });

// // ========== CUSTOM INPUT MODAL ==========
// function createInputModal() {
//   const modal = document.createElement('div');
//   modal.id = 'input-modal';
//   modal.innerHTML = `
//     <div class="modal-overlay">
//       <div class="modal-content">
//         <h3 id="modal-title">Enter value</h3>
//         <input type="text" id="modal-input" placeholder="Enter value...">
//         <div class="modal-buttons">
//           <button id="modal-ok" class="modal-btn modal-btn-primary">OK</button>
//           <button id="modal-cancel" class="modal-btn">Cancel</button>
//         </div>
//       </div>
//     </div>
//   `;

//   const style = document.createElement('style');
//   style.textContent = `
//     #input-modal {
//       display: none;
//       position: fixed;
//       top: 0;
//       left: 0;
//       right: 0;
//       bottom: 0;
//       z-index: 100000;
//     }

//     .modal-overlay {
//       width: 100%;
//       height: 100%;
//       background: rgba(0, 0, 0, 0.7);
//       display: flex;
//       align-items: center;
//       justify-content: center;
//       animation: fadeIn 0.15s ease;
//     }

//     .modal-content {
//       background: #1a1a1a;
//       border: 1px solid #3a3a3a;
//       border-radius: 8px;
//       padding: 24px;
//       min-width: 400px;
//       box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
//       animation: slideDown 0.15s ease;
//     }

//     #modal-title {
//       margin: 0 0 16px 0;
//       color: #e5e7eb;
//       font-size: 16px;
//       font-weight: 600;
//     }

//     #modal-input {
//       width: 100%;
//       padding: 10px 12px;
//       background: #0a0a0a;
//       border: 1px solid #3a3a3a;
//       border-radius: 4px;
//       color: #e5e7eb;
//       font-size: 14px;
//       font-family: inherit;
//       outline: none;
//       margin-bottom: 16px;
//     }

//     #modal-input:focus {
//       border-color: #4a90e2;
//     }

//     .modal-buttons {
//       display: flex;
//       gap: 8px;
//       justify-content: flex-end;
//     }

//     .modal-btn {
//       padding: 8px 16px;
//       border: 1px solid #3a3a3a;
//       border-radius: 4px;
//       background: #2a2a2a;
//       color: #e5e7eb;
//       font-size: 13px;
//       font-weight: 500;
//       cursor: pointer;
//       transition: all 0.15s;
//     }

//     .modal-btn:hover {
//       background: #3a3a3a;
//     }

//     .modal-btn-primary {
//       background: #4a90e2;
//       border-color: #4a90e2;
//     }

//     .modal-btn-primary:hover {
//       background: #357abd;
//     }

//     @keyframes fadeIn {
//       from { opacity: 0; }
//       to { opacity: 1; }
//     }

//     @keyframes slideDown {
//       from { 
//         opacity: 0;
//         transform: translateY(-20px);
//       }
//       to { 
//         opacity: 1;
//         transform: translateY(0);
//       }
//     }
//   `;

//   document.head.appendChild(style);
//   document.body.appendChild(modal);
// }

// function showInputModal(title, placeholder = '', defaultValue = '') {
//   return new Promise((resolve) => {
//     const modal = document.getElementById('input-modal');
//     const titleEl = document.getElementById('modal-title');
//     const input = document.getElementById('modal-input');
//     const okBtn = document.getElementById('modal-ok');
//     const cancelBtn = document.getElementById('modal-cancel');

//     titleEl.textContent = title;
//     input.placeholder = placeholder;
//     input.value = defaultValue;

//     modal.style.display = 'block';

//     // Focus input after a brief delay
//     setTimeout(() => {
//       input.focus();
//       input.select();
//     }, 100);

//     const cleanup = (value) => {
//       modal.style.display = 'none';
//       input.value = '';
//       okBtn.onclick = null;
//       cancelBtn.onclick = null;
//       input.onkeydown = null;
//       resolve(value);
//     };

//     okBtn.onclick = () => {
//       cleanup(input.value.trim());
//     };

//     cancelBtn.onclick = () => {
//       cleanup(null);
//     };

//     input.onkeydown = (e) => {
//       if (e.key === 'Enter') {
//         cleanup(input.value.trim());
//       } else if (e.key === 'Escape') {
//         cleanup(null);
//       }
//     };
//   });
// }

// // ========== MONACO EDITOR ==========
// async function initMonaco() {
//   console.log('📝 Initializing Monaco Editor...');

//   await new Promise(resolve => {
//     if (typeof monaco !== 'undefined') {
//       resolve();
//     } else {
//       const check = setInterval(() => {
//         if (typeof monaco !== 'undefined') {
//           clearInterval(check);
//           resolve();
//         }
//       }, 100);
//     }
//   });

//   // Create editor
//   state.editor = monaco.editor.create(document.getElementById('monaco-editor'), {
//     value: '// Welcome to Codium!\n// Open a folder (📂) and click on any file to start editing\n// All programming languages are supported\n// Use the controls at the top to change theme, font, and font size',
//     language: 'javascript',
//     theme: state.theme,
//     automaticLayout: true,
//     fontSize: state.fontSize,
//     fontFamily: `${state.fontFamily}, Consolas, "Courier New", monospace`,
//     minimap: { enabled: true },
//     scrollBeyondLastLine: false,
//     wordWrap: 'off',
//     lineNumbers: 'on',
//     renderWhitespace: 'selection',
//     bracketPairColorization: { enabled: true }
//   });

//   // Define custom themes
//   monaco.editor.defineTheme('codium-dark', {
//     base: 'vs-dark',
//     inherit: true,
//     rules: [
//       { token: 'comment', foreground: '6A9955' },
//       { token: 'keyword', foreground: '5FAED9' },
//       { token: 'string', foreground: 'CE9178' },
//       { token: 'number', foreground: 'B5CEA8' }
//     ],
//     colors: {
//       'editor.background': '#0B192C',
//       'editor.foreground': '#e5e7eb',
//       'editor.lineHighlightBackground': '#1a2332',
//       'editorCursor.foreground': '#888888',
//       'editor.selectionBackground': '#3a3a3a66'
//     }
//   });

//   // Keyboard shortcuts
//   state.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, saveCurrentFile);

//   console.log('✅ Monaco ready!');
// }

// // ========== EDITOR SETTINGS ==========
// function initEditorSettings() {
//   // Theme selector
//   const themeSelect = document.getElementById('theme-select');
//   themeSelect.value = state.theme;
//   themeSelect.addEventListener('change', (e) => {
//     state.theme = e.target.value;
//     monaco.editor.setTheme(state.theme);
//     console.log('Theme changed to:', state.theme);
//   });

//   // Font selector
//   const fontSelect = document.getElementById('font-select');
//   fontSelect.value = state.fontFamily;
//   fontSelect.addEventListener('change', (e) => {
//     state.fontFamily = e.target.value;
//     updateEditorFont();
//     console.log('Font changed to:', state.fontFamily);
//   });

//   // Font size controls
//   document.getElementById('font-increase').addEventListener('click', () => {
//     if (state.fontSize < 30) {
//       state.fontSize += 2;
//       updateEditorFont();
//     }
//   });

//   document.getElementById('font-decrease').addEventListener('click', () => {
//     if (state.fontSize > 8) {
//       state.fontSize -= 2;
//       updateEditorFont();
//     }
//   });

//   updateFontSizeDisplay();
// }

// function updateEditorFont() {
//   state.editor.updateOptions({
//     fontSize: state.fontSize,
//     fontFamily: `${state.fontFamily}, Consolas, "Courier New", monospace`
//   });
//   updateFontSizeDisplay();
//   console.log(`Font updated: ${state.fontFamily} ${state.fontSize}px`);
// }

// function updateFontSizeDisplay() {
//   document.getElementById('font-size-display').textContent = state.fontSize;
// }

// // ========== EVENT LISTENERS ==========
// async function initEventListeners() {
//   console.log('Setting up event listeners...');

//   // Wait a bit for DOM to be fully ready
//   await new Promise(resolve => setTimeout(resolve, 100));

//   // Open folder button in header
//   const openFolderBtn = document.getElementById('open-folder-btn');
//   if (openFolderBtn) {
//     const newBtn = openFolderBtn.cloneNode(true);
//     openFolderBtn.parentNode.replaceChild(newBtn, openFolderBtn);

//     newBtn.addEventListener('click', (e) => {
//       e.preventDefault();
//       e.stopPropagation();
//       openFolder();
//     });
//     console.log('✅ Open folder button listener added');
//   }

//   // Open folder button in empty state
//   const emptyBtn = document.getElementById('open-folder-empty');
//   if (emptyBtn) {
//     const newEmptyBtn = emptyBtn.cloneNode(true);
//     emptyBtn.parentNode.replaceChild(newEmptyBtn, emptyBtn);

//     newEmptyBtn.addEventListener('click', (e) => {
//       e.preventDefault();
//       e.stopPropagation();
//       openFolder();
//     });
//     console.log('✅ Empty state button listener added');
//   }

//   // New file button
//   const newFileBtn = document.getElementById('new-file-btn');
//   if (newFileBtn) {
//     const newBtn = newFileBtn.cloneNode(true);
//     newFileBtn.parentNode.replaceChild(newBtn, newFileBtn);

//     newBtn.addEventListener('click', async (e) => {
//       console.log('🔴 NEW FILE BUTTON CLICKED!');
//       e.preventDefault();
//       e.stopPropagation();

//       try {
//         await handleCreateNewFile();
//       } catch (error) {
//         console.error('Error in new file handler:', error);
//         alert('Error creating file: ' + error.message);
//       }
//     });
//     console.log('✅ New file button listener added');
//   }

//   // Refresh button
//   const refreshBtn = document.getElementById('refresh-btn');
//   if (refreshBtn) {
//     const newRefreshBtn = refreshBtn.cloneNode(true);
//     refreshBtn.parentNode.replaceChild(newRefreshBtn, refreshBtn);

//     newRefreshBtn.addEventListener('click', () => {
//       if (state.currentFolder) {
//         loadFileTree(state.currentFolder);
//       }
//     });
//     console.log('✅ Refresh button listener added');
//   }

//   // Hide context menu on click
//   document.addEventListener('click', () => {
//     const menu = document.getElementById('context-menu');
//     if (menu) menu.style.display = 'none';
//   });

//   console.log('All event listeners set up!');
// }

// // ========== CREATE NEW FILE - MAIN FUNCTION ==========
// async function handleCreateNewFile() {
//   console.log('📝 handleCreateNewFile() CALLED');

//   // Check if folder is open
//   if (!state.currentFolder) {
//     console.error('❌ No current folder!');
//     alert('Please open a folder first!');
//     return;
//   }

//   // Use custom modal instead of prompt
//   const fileName = await showInputModal(
//     'Create New File',
//     'e.g., test.js, index.html, main.py'
//   );

//   console.log('User entered file name:', fileName);

//   if (!fileName) {
//     console.log('User cancelled');
//     return;
//   }

//   console.log('Creating file:', fileName);

//   try {
//     // Determine the path separator
//     const separator = state.currentFolder.includes('\\') ? '\\' : '/';

//     // Build full path
//     let fullPath = state.currentFolder;
//     if (!fullPath.endsWith(separator)) {
//       fullPath += separator;
//     }
//     fullPath += fileName;

//     console.log('Full file path:', fullPath);

//     // Create the file with empty content
//     await window.fileSystem.writeFile(fullPath, '');
//     console.log('✅ File written to disk');

//     // Show success notification
//     showNotification(`Created: ${fileName}`);

//     // Reload the file tree
//     await loadFileTree(state.currentFolder);
//     console.log('✅ File tree reloaded');

//     // Open the file in editor
//     await openFile(fullPath);
//     console.log('✅ File opened in editor');

//   } catch (error) {
//     console.error('❌ ERROR CREATING FILE:', error);
//     alert(`Error creating file: ${error.message}`);
//   }
// }

// // ========== FOLDER OPERATIONS ==========
// async function openFolder() {
//   console.log('📂 Opening folder...');

//   try {
//     const path = await window.fileSystem.selectFolder();

//     if (!path) {
//       return;
//     }

//     state.currentFolder = path;
//     const folderName = path.split(/[\\/]/).pop();
//     document.getElementById('folder-name').textContent = folderName.toUpperCase();

//     await loadFileTree(path);
//     console.log('✅ Folder opened:', path);
//   } catch (error) {
//     console.error('Error opening folder:', error);
//     alert('Error opening folder: ' + error.message);
//   }
// }

// async function loadFileTree(path) {
//   console.log('🌳 Loading file tree...');

//   try {
//     const items = await window.fileSystem.readDirectory(path);
//     const container = document.getElementById('file-tree');
//     container.className = 'file-tree-content';
//     container.innerHTML = '';

//     renderTree(items, container, path, 0);
//   } catch (error) {
//     console.error('❌ Error loading tree:', error);
//     alert('Error loading folder: ' + error.message);
//   }
// }

// function renderTree(items, container, basePath, level) {
//   items.forEach(item => {
//     const separator = basePath.includes('\\') ? '\\' : '/';
//     const fullPath = basePath.endsWith(separator)
//       ? basePath + item.name
//       : basePath + separator + item.name;

//     // Create tree item
//     const div = document.createElement('div');
//     div.className = 'tree-item';
//     div.style.paddingLeft = (level * 16 + 8) + 'px';
//     div.dataset.path = fullPath;
//     div.dataset.isDir = item.isDirectory;

//     // Arrow for folders
//     const arrow = document.createElement('span');
//     arrow.className = 'tree-arrow';
//     if (item.isDirectory) {
//       arrow.textContent = state.expandedFolders.has(fullPath) ? '▼' : '▶';
//       arrow.onclick = (e) => {
//         e.stopPropagation();
//         toggleFolder(fullPath);
//       };
//     }
//     div.appendChild(arrow);

//     // Icon
//     const icon = document.createElement('span');
//     icon.className = 'tree-icon';
//     icon.textContent = getFileIcon(item.name, item.isDirectory);
//     div.appendChild(icon);

//     // Label
//     const label = document.createElement('span');
//     label.className = 'tree-label';
//     label.textContent = item.name;
//     div.appendChild(label);

//     // Click handler
//     div.onclick = () => {
//       document.querySelectorAll('.tree-item').forEach(el => el.classList.remove('selected'));
//       div.classList.add('selected');

//       if (!item.isDirectory) {
//         openFile(fullPath);
//       }
//     };

//     // Context menu
//     div.oncontextmenu = (e) => {
//       e.preventDefault();
//       showContextMenu(e, fullPath, item.isDirectory);
//     };

//     container.appendChild(div);

//     // Render children if expanded
//     if (item.isDirectory && state.expandedFolders.has(fullPath) && item.children) {
//       renderTree(item.children, container, fullPath, level + 1);
//     }
//   });
// }

// function toggleFolder(path) {
//   if (state.expandedFolders.has(path)) {
//     state.expandedFolders.delete(path);
//   } else {
//     state.expandedFolders.add(path);
//   }
//   loadFileTree(state.currentFolder);
// }

// // ========== FILE OPERATIONS ==========
// async function openFile(path) {
//   console.log('📄 Opening file:', path);

//   // If already open, just switch to it
//   if (state.openTabs.has(path)) {
//     switchToTab(path);
//     return;
//   }

//   try {
//     const content = await window.fileSystem.readFile(path);
//     const language = detectLanguage(path);

//     // Create Monaco model
//     const model = monaco.editor.createModel(content, language);

//     // Store tab
//     state.openTabs.set(path, {
//       model: model,
//       viewState: null,
//       modified: false
//     });

//     // Listen for changes
//     model.onDidChangeContent(() => {
//       const tab = state.openTabs.get(path);
//       if (tab) {
//         tab.modified = true;
//         updateTabUI(path);
//       }
//     });

//     // Create tab UI
//     createTab(path);

//     // Switch to tab
//     switchToTab(path);

//     console.log('✅ File opened:', path);
//   } catch (error) {
//     console.error('❌ Error opening file:', error);
//     alert('Error opening file: ' + error.message);
//   }
// }

// function createTab(path) {
//   const container = document.getElementById('tabs-container');
//   const fileName = path.split(/[\\/]/).pop();

//   const tab = document.createElement('div');
//   tab.className = 'tab';
//   tab.dataset.path = path;

//   const icon = document.createElement('span');
//   icon.className = 'tab-icon';
//   icon.textContent = getFileIcon(fileName, false);
//   tab.appendChild(icon);

//   const label = document.createElement('span');
//   label.className = 'tab-label';
//   label.textContent = fileName;
//   tab.appendChild(label);

//   const modified = document.createElement('span');
//   modified.className = 'tab-modified';
//   modified.style.display = 'none';
//   modified.textContent = '●';
//   tab.appendChild(modified);

//   const close = document.createElement('span');
//   close.className = 'tab-close';
//   close.textContent = '×';
//   close.onclick = (e) => {
//     e.stopPropagation();
//     closeTab(path);
//   };
//   tab.appendChild(close);

//   tab.onclick = () => switchToTab(path);

//   container.appendChild(tab);
// }

// function switchToTab(path) {
//   // Save current view state
//   if (state.activeTab && state.openTabs.has(state.activeTab)) {
//     state.openTabs.get(state.activeTab).viewState = state.editor.saveViewState();
//   }

//   // Switch to new tab
//   state.activeTab = path;
//   const tab = state.openTabs.get(path);

//   if (tab) {
//     state.editor.setModel(tab.model);

//     if (tab.viewState) {
//       state.editor.restoreViewState(tab.viewState);
//     }

//     // Update UI
//     document.querySelectorAll('.tab').forEach(el => {
//       el.classList.toggle('active', el.dataset.path === path);
//     });

//     state.editor.focus();
//   }
// }

// async function closeTab(path) {
//   const tab = state.openTabs.get(path);

//   if (tab && tab.modified) {
//     const save = confirm(`${path.split(/[\\/]/).pop()} has unsaved changes. Save?`);
//     if (save) {
//       await saveFile(path);
//     }
//   }

//   // Dispose model
//   if (tab) tab.model.dispose();

//   // Remove from state
//   state.openTabs.delete(path);

//   // Remove tab element
//   const tabEl = document.querySelector(`.tab[data-path="${CSS.escape(path)}"]`);
//   if (tabEl) tabEl.remove();

//   // Switch to another tab or welcome screen
//   if (state.activeTab === path) {
//     const remaining = Array.from(state.openTabs.keys());
//     if (remaining.length > 0) {
//       switchToTab(remaining[0]);
//     } else {
//       state.activeTab = null;
//       const welcome = monaco.editor.createModel(
//         '// Welcome to Codium!\n// Open a folder (📂) and click on any file to start editing\n// All programming languages are supported\n// Use the controls at the top to change theme, font, and font size',
//         'javascript'
//       );
//       state.editor.setModel(welcome);
//     }
//   }
// }

// async function saveFile(path) {
//   const tab = state.openTabs.get(path);
//   if (!tab) return;

//   try {
//     const content = tab.model.getValue();
//     await window.fileSystem.writeFile(path, content);

//     tab.modified = false;
//     updateTabUI(path);

//     console.log('💾 File saved:', path);
//     showNotification('File saved!');
//   } catch (error) {
//     console.error('❌ Error saving:', error);
//     alert('Error saving file: ' + error.message);
//   }
// }

// async function saveCurrentFile() {
//   if (state.activeTab) {
//     await saveFile(state.activeTab);
//   }
// }

// function updateTabUI(path) {
//   const tabEl = document.querySelector(`.tab[data-path="${CSS.escape(path)}"]`);
//   const tab = state.openTabs.get(path);

//   if (tabEl && tab) {
//     const modified = tabEl.querySelector('.tab-modified');
//     modified.style.display = tab.modified ? 'inline' : 'none';
//   }
// }

// // ========== UTILITIES ==========
// function detectLanguage(path) {
//   const ext = path.split('.').pop().toLowerCase();
//   const map = {
//     js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript',
//     py: 'python', java: 'java', cpp: 'cpp', c: 'c', cs: 'csharp',
//     html: 'html', css: 'css', scss: 'scss', json: 'json',
//     md: 'markdown', xml: 'xml', yaml: 'yaml', yml: 'yaml',
//     sh: 'shell', sql: 'sql', php: 'php', rb: 'ruby',
//     go: 'go', rs: 'rust', swift: 'swift', kt: 'kotlin'
//   };
//   return map[ext] || 'plaintext';
// }

// function getFileIcon(name, isDir) {
//   if (isDir) return '📁';

//   const ext = name.split('.').pop().toLowerCase();
//   const icons = {
//     js: '🟨', jsx: '⚛️', ts: '🔷', tsx: '⚛️',
//     py: '🐍', java: '☕', cpp: '⚙️', c: '⚙️',
//     html: '🌐', css: '🎨', json: '📋', md: '📝',
//     png: '🖼️', jpg: '🖼️', gif: '🖼️', svg: '🖼️'
//   };
//   return icons[ext] || '📄';
// }

// async function showContextMenu(e, path, isDir) {
//   const menu = document.getElementById('context-menu');
//   menu.style.display = 'block';
//   menu.style.left = e.pageX + 'px';
//   menu.style.top = e.pageY + 'px';

//   // Remove old event listeners by cloning
//   const newMenu = menu.cloneNode(true);
//   menu.parentNode.replaceChild(newMenu, menu);

//   newMenu.onclick = async (event) => {
//     const action = event.target.dataset.action;
//     if (!action) return;

//     newMenu.style.display = 'none';

//     if (action === 'new-file') {
//       await handleCreateNewFile();
//     } else if (action === 'rename') {
//       const oldName = path.split(/[\\/]/).pop();
//       const newName = await showInputModal('Rename', 'Enter new name', oldName);

//       if (newName && newName !== oldName) {
//         const separator = path.includes('\\') ? '\\' : '/';
//         const newPath = path.substring(0, path.lastIndexOf(separator)) + separator + newName;
//         try {
//           await window.fileSystem.renameItem(path, newPath);
//           await loadFileTree(state.currentFolder);
//           showNotification('Renamed successfully!');
//         } catch (error) {
//           alert('Error renaming: ' + error.message);
//         }
//       }
//     } else if (action === 'delete') {
//       if (confirm('Delete ' + path + '?')) {
//         try {
//           await window.fileSystem.deleteItem(path);
//           await loadFileTree(state.currentFolder);
//           showNotification('Deleted successfully!');
//         } catch (error) {
//           alert('Error deleting: ' + error.message);
//         }
//       }
//     }
//   };
// }

// function showNotification(message) {
//   const notif = document.createElement('div');
//   notif.textContent = message;
//   notif.style.cssText = `
//     position: fixed; bottom: 30px; right: 30px;
//     background: #22c55e; color: white;
//     padding: 10px 20px; border-radius: 6px;
//     font-size: 13px; z-index: 10000;
//     animation: slideIn 0.3s ease;
//     box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
//   `;

//   const style = document.createElement('style');
//   style.textContent = `
//     @keyframes slideIn {
//       from { transform: translateX(100px); opacity: 0; }
//       to { transform: translateX(0); opacity: 1; }
//     }
//   `;
//   document.head.appendChild(style);

//   document.body.appendChild(notif);
//   setTimeout(() => notif.remove(), 2000);
// }






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
  await initEventListeners();
  initEditorSettings();
  createInputModal();

  console.log('✅ Codium ready!');
});

// ========== CUSTOM INPUT MODAL ==========
function createInputModal() {
  const modal = document.createElement('div');
  modal.id = 'input-modal';
  modal.innerHTML = `
    <div class="modal-overlay">
      <div class="modal-content">
        <h3 id="modal-title">Enter value</h3>
        <input type="text" id="modal-input" placeholder="Enter value...">
        <div class="modal-buttons">
          <button id="modal-ok" class="modal-btn modal-btn-primary">OK</button>
          <button id="modal-cancel" class="modal-btn">Cancel</button>
        </div>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    #input-modal {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 100000;
    }
    
    .modal-overlay {
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.15s ease;
    }
    
    .modal-content {
      background: #1a1a1a;
      border: 1px solid #3a3a3a;
      border-radius: 8px;
      padding: 24px;
      min-width: 400px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
      animation: slideDown 0.15s ease;
    }
    
    #modal-title {
      margin: 0 0 16px 0;
      color: #e5e7eb;
      font-size: 16px;
      font-weight: 600;
    }
    
    #modal-input {
      width: 100%;
      padding: 10px 12px;
      background: #0a0a0a;
      border: 1px solid #3a3a3a;
      border-radius: 4px;
      color: #e5e7eb;
      font-size: 14px;
      font-family: inherit;
      outline: none;
      margin-bottom: 16px;
    }
    
    #modal-input:focus {
      border-color: #4a90e2;
    }
    
    .modal-buttons {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }
    
    .modal-btn {
      padding: 8px 16px;
      border: 1px solid #3a3a3a;
      border-radius: 4px;
      background: #2a2a2a;
      color: #e5e7eb;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s;
    }
    
    .modal-btn:hover {
      background: #3a3a3a;
    }
    
    .modal-btn-primary {
      background: #4a90e2;
      border-color: #4a90e2;
    }
    
    .modal-btn-primary:hover {
      background: #357abd;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes slideDown {
      from { 
        opacity: 0;
        transform: translateY(-20px);
      }
      to { 
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(modal);
}

function showInputModal(title, placeholder = '', defaultValue = '') {
  return new Promise((resolve) => {
    const modal = document.getElementById('input-modal');
    const titleEl = document.getElementById('modal-title');
    const input = document.getElementById('modal-input');
    const okBtn = document.getElementById('modal-ok');
    const cancelBtn = document.getElementById('modal-cancel');

    titleEl.textContent = title;
    input.placeholder = placeholder;
    input.value = defaultValue;

    modal.style.display = 'block';

    // Focus input after a brief delay
    setTimeout(() => {
      input.focus();
      input.select();
    }, 100);

    // Stop all keyboard events from bubbling to Monaco
    input.addEventListener('keydown', (e) => e.stopPropagation(), true);
    input.addEventListener('keyup', (e) => e.stopPropagation(), true);
    input.addEventListener('keypress', (e) => e.stopPropagation(), true);

    const cleanup = (value) => {
      modal.style.display = 'none';
      input.value = '';
      okBtn.onclick = null;
      cancelBtn.onclick = null;
      input.onkeydown = null;
      resolve(value);
    };

    okBtn.onclick = () => {
      cleanup(input.value.trim());
    };

    cancelBtn.onclick = () => {
      cleanup(null);
    };

    input.onkeydown = (e) => {
      e.stopPropagation();
      if (e.key === 'Enter') {
        cleanup(input.value.trim());
      } else if (e.key === 'Escape') {
        cleanup(null);
      }
    };

    input.onkeyup = (e) => e.stopPropagation();
    input.onkeypress = (e) => e.stopPropagation();
  });
}

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
      { token: 'keyword', foreground: '5FAED9' },
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
async function initEventListeners() {
  console.log('Setting up event listeners...');

  // Wait a bit for DOM to be fully ready
  await new Promise(resolve => setTimeout(resolve, 100));

  // Open folder button in header
  const openFolderBtn = document.getElementById('open-folder-btn');
  if (openFolderBtn) {
    const newBtn = openFolderBtn.cloneNode(true);
    openFolderBtn.parentNode.replaceChild(newBtn, openFolderBtn);

    newBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openFolder();
    });
    console.log('✅ Open folder button listener added');
  }

  // Open folder button in empty state
  const emptyBtn = document.getElementById('open-folder-empty');
  if (emptyBtn) {
    const newEmptyBtn = emptyBtn.cloneNode(true);
    emptyBtn.parentNode.replaceChild(newEmptyBtn, emptyBtn);

    newEmptyBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openFolder();
    });
    console.log('✅ Empty state button listener added');
  }

  // New file button
  const newFileBtn = document.getElementById('new-file-btn');
  if (newFileBtn) {
    const newBtn = newFileBtn.cloneNode(true);
    newFileBtn.parentNode.replaceChild(newBtn, newFileBtn);

    newBtn.addEventListener('click', async (e) => {
      console.log('🔴 NEW FILE BUTTON CLICKED!');
      e.preventDefault();
      e.stopPropagation();

      try {
        await handleCreateNewFile();
      } catch (error) {
        console.error('Error in new file handler:', error);
        alert('Error creating file: ' + error.message);
      }
    });
    console.log('✅ New file button listener added');
  }

  // Refresh button
  const refreshBtn = document.getElementById('refresh-btn');
  if (refreshBtn) {
    const newRefreshBtn = refreshBtn.cloneNode(true);
    refreshBtn.parentNode.replaceChild(newRefreshBtn, refreshBtn);

    newRefreshBtn.addEventListener('click', () => {
      if (state.currentFolder) {
        loadFileTree(state.currentFolder);
      }
    });
    console.log('✅ Refresh button listener added');
  }

  // Hide context menu on click
  document.addEventListener('click', () => {
    const menu = document.getElementById('context-menu');
    if (menu) menu.style.display = 'none';
  });

  console.log('All event listeners set up!');
}

// ========== CREATE NEW FILE - MAIN FUNCTION ==========
async function handleCreateNewFile() {
  console.log('📝 handleCreateNewFile() CALLED');

  // Check if folder is open
  if (!state.currentFolder) {
    console.error('❌ No current folder!');
    alert('Please open a folder first!');
    return;
  }

  // Use custom modal instead of prompt
  const fileName = await showInputModal(
    'Create New File',
    'e.g., test.js, index.html, main.py'
  );

  console.log('User entered file name:', fileName);

  if (!fileName) {
    console.log('User cancelled');
    return;
  }

  console.log('Creating file:', fileName);

  try {
    // Determine the path separator
    const separator = state.currentFolder.includes('\\') ? '\\' : '/';

    // Build full path
    let fullPath = state.currentFolder;
    if (!fullPath.endsWith(separator)) {
      fullPath += separator;
    }
    fullPath += fileName;

    console.log('Full file path:', fullPath);

    // Create the file with empty content
    await window.fileSystem.writeFile(fullPath, '');
    console.log('✅ File written to disk');

    // Show success notification
    showNotification(`Created: ${fileName}`);

    // Reload the file tree
    await loadFileTree(state.currentFolder);
    console.log('✅ File tree reloaded');

    // Open the file in editor
    await openFile(fullPath);
    console.log('✅ File opened in editor');

  } catch (error) {
    console.error('❌ ERROR CREATING FILE:', error);
    alert(`Error creating file: ${error.message}`);
  }
}

// ========== FOLDER OPERATIONS ==========
async function openFolder() {
  console.log('📂 Opening folder...');

  try {
    const path = await window.fileSystem.selectFolder();

    if (!path) {
      return;
    }

    state.currentFolder = path;
    const folderName = path.split(/[\\/]/).pop();
    document.getElementById('folder-name').textContent = folderName.toUpperCase();

    await loadFileTree(path);
    console.log('✅ Folder opened:', path);
  } catch (error) {
    console.error('Error opening folder:', error);
    alert('Error opening folder: ' + error.message);
  }
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
      renderTree(item.children, container, fullPath, level + 1);
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

async function showContextMenu(e, path, isDir) {
  const menu = document.getElementById('context-menu');
  menu.style.display = 'block';
  menu.style.left = e.pageX + 'px';
  menu.style.top = e.pageY + 'px';

  // Remove old event listeners by cloning
  const newMenu = menu.cloneNode(true);
  menu.parentNode.replaceChild(newMenu, menu);

  newMenu.onclick = async (event) => {
    const action = event.target.dataset.action;
    if (!action) return;

    newMenu.style.display = 'none';

    if (action === 'new-file') {
      await handleCreateNewFile();
    } else if (action === 'rename') {
      const oldName = path.split(/[\\/]/).pop();
      const newName = await showInputModal('Rename', 'Enter new name', oldName);

      if (newName && newName !== oldName) {
        const separator = path.includes('\\') ? '\\' : '/';
        const newPath = path.substring(0, path.lastIndexOf(separator)) + separator + newName;
        try {
          await window.fileSystem.renameItem(path, newPath);
          await loadFileTree(state.currentFolder);
          showNotification('Renamed successfully!');
        } catch (error) {
          alert('Error renaming: ' + error.message);
        }
      }
    } else if (action === 'delete') {
      if (confirm('Delete ' + path + '?')) {
        try {
          await window.fileSystem.deleteItem(path);
          await loadFileTree(state.currentFolder);
          showNotification('Deleted successfully!');
        } catch (error) {
          alert('Error deleting: ' + error.message);
        }
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
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
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