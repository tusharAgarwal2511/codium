// Monaco Editor Integration with Tab System
class MonacoEditorManager {
    constructor() {
        this.editor = null;
        this.openTabs = new Map(); // path -> { content, model, viewState, modified }
        this.activeTab = null;
        this.init();
    }

    async init() {
        console.log('Initializing Monaco Editor Manager');

        // Wait for Monaco to load
        await new Promise((resolve) => {
            if (typeof monaco !== 'undefined') {
                resolve();
            } else {
                const checkMonaco = setInterval(() => {
                    if (typeof monaco !== 'undefined') {
                        clearInterval(checkMonaco);
                        resolve();
                    }
                }, 100);
            }
        });

        console.log('Monaco library loaded');

        // Create Monaco Editor
        this.editor = monaco.editor.create(document.getElementById('monaco-editor'), {
            value: '// Welcome to Codium\n// Open a folder from the explorer and click on a file to start editing\n// Press Ctrl+S (Cmd+S on Mac) to save',
            language: 'javascript',
            theme: 'vs-dark',
            automaticLayout: true,
            fontSize: 14,
            fontFamily: 'Fira Code, Menlo, Monaco, "Courier New", monospace',
            minimap: {
                enabled: true
            },
            scrollBeyondLastLine: false,
            renderWhitespace: 'selection',
            rulers: [80, 120],
            formatOnPaste: true,
            formatOnType: true,
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnEnter: 'on',
            tabCompletion: 'on',
            wordWrap: 'off',
            lineNumbers: 'on',
            glyphMargin: true,
            folding: true,
            bracketPairColorization: {
                enabled: true
            }
        });

        console.log('Monaco Editor created');

        // Custom theme
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

        monaco.editor.setTheme('codium-dark');

        // Add keyboard shortcuts
        this.addKeyboardShortcuts();

        // Connect to file explorer
        const connectToExplorer = () => {
            if (window.fileExplorer) {
                console.log('Connecting to file explorer');
                window.fileExplorer.onFileOpen((path, content) => {
                    console.log('File open callback triggered:', path);
                    this.openFile(path, content);
                });
            } else {
                console.log('File explorer not ready, retrying...');
                setTimeout(connectToExplorer, 100);
            }
        };

        connectToExplorer();

        console.log('Monaco Editor fully initialized');
    }

    openFile(path, content) {
        console.log('Opening file in Monaco:', path);

        // If already open, just switch to it
        if (this.openTabs.has(path)) {
            console.log('File already open, switching tab');
            this.switchToTab(path);
            return;
        }

        // Detect language from file extension
        const language = this.detectLanguage(path);
        console.log('Detected language:', language);

        // Create a new model for this file
        const model = monaco.editor.createModel(content, language);

        // Store tab info
        this.openTabs.set(path, {
            content,
            model,
            viewState: null,
            modified: false
        });

        console.log('Created new model for file');

        // Create tab UI
        this.createTab(path);

        // Switch to the new tab
        this.switchToTab(path);

        // Listen for content changes
        model.onDidChangeContent(() => {
            const tab = this.openTabs.get(path);
            if (tab) {
                tab.modified = true;
                this.updateTabModifiedState(path);
            }
        });

        console.log('File opened successfully');
    }

    createTab(path) {
        const tabsContainer = document.getElementById('tabs-container');
        const fileName = path.split(/[\\/]/).pop();

        const tab = document.createElement('div');
        tab.className = 'tab';
        tab.dataset.path = path;

        const icon = document.createElement('span');
        icon.className = 'tab-icon';
        icon.textContent = this.getFileIcon(fileName);
        tab.appendChild(icon);

        const label = document.createElement('span');
        label.className = 'tab-label';
        label.textContent = fileName;
        tab.appendChild(label);

        const closeBtn = document.createElement('span');
        closeBtn.className = 'tab-close';
        closeBtn.textContent = '×';
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeTab(path);
        });
        tab.appendChild(closeBtn);

        tab.addEventListener('click', () => {
            this.switchToTab(path);
        });

        tabsContainer.appendChild(tab);
        console.log('Created tab for:', fileName);
    }

    switchToTab(path) {
        console.log('Switching to tab:', path);

        // Save current view state
        if (this.activeTab && this.openTabs.has(this.activeTab)) {
            const currentTab = this.openTabs.get(this.activeTab);
            currentTab.viewState = this.editor.saveViewState();
        }

        // Switch to new tab
        this.activeTab = path;
        const tab = this.openTabs.get(path);

        if (tab) {
            this.editor.setModel(tab.model);

            // Restore view state if exists
            if (tab.viewState) {
                this.editor.restoreViewState(tab.viewState);
            }

            // Update UI
            document.querySelectorAll('.tab').forEach(t => {
                t.classList.remove('active');
                if (t.dataset.path === path) {
                    t.classList.add('active');
                }
            });

            this.editor.focus();
            console.log('Switched to tab successfully');
        }
    }

    async closeTab(path) {
        const tab = this.openTabs.get(path);

        if (tab && tab.modified) {
            const shouldSave = confirm(`${path.split(/[\\/]/).pop()} has unsaved changes. Save before closing?`);
            if (shouldSave) {
                await this.saveFile(path);
            }
        }

        // Dispose model
        if (tab && tab.model) {
            tab.model.dispose();
        }

        // Remove from tabs
        this.openTabs.delete(path);

        // Remove tab UI
        const tabElement = document.querySelector(`.tab[data-path="${CSS.escape(path)}"]`);
        if (tabElement) {
            tabElement.remove();
        }

        // Switch to another tab or show welcome message
        if (this.activeTab === path) {
            const remainingTabs = Array.from(this.openTabs.keys());
            if (remainingTabs.length > 0) {
                this.switchToTab(remainingTabs[0]);
            } else {
                this.activeTab = null;
                const welcomeModel = monaco.editor.createModel(
                    '// Welcome to Codium\n// Open a folder from the explorer and click on a file to start editing\n// Press Ctrl+S (Cmd+S on Mac) to save',
                    'javascript'
                );
                this.editor.setModel(welcomeModel);
            }
        }
    }

    async saveFile(path = null) {
        const targetPath = path || this.activeTab;
        if (!targetPath) {
            console.log('No active file to save');
            return;
        }

        const tab = this.openTabs.get(targetPath);
        if (!tab) {
            console.log('Tab not found for path:', targetPath);
            return;
        }

        try {
            const content = tab.model.getValue();
            await window.fileSystem.writeFile(targetPath, content);

            tab.modified = false;
            this.updateTabModifiedState(targetPath);

            console.log('Saved file:', targetPath);

            // Show a brief saved indicator (optional)
            this.showSaveIndicator();
        } catch (error) {
            console.error('Error saving file:', error);
            alert('Error saving file: ' + error.message);
        }
    }

    showSaveIndicator() {
        // Create a brief "Saved" indicator
        const indicator = document.createElement('div');
        indicator.textContent = 'File saved';
        indicator.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #22c55e;
            color: white;
            padding: 8px 16px;
            border-radius: 4px;
            font-size: 13px;
            z-index: 10000;
            animation: fadeInOut 2s ease-in-out;
        `;

        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translateY(10px); }
                20% { opacity: 1; transform: translateY(0); }
                80% { opacity: 1; transform: translateY(0); }
                100% { opacity: 0; transform: translateY(-10px); }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(indicator);
        setTimeout(() => indicator.remove(), 2000);
    }

    updateTabModifiedState(path) {
        const tabElement = document.querySelector(`.tab[data-path="${CSS.escape(path)}"]`);
        const tab = this.openTabs.get(path);

        if (tabElement && tab) {
            const label = tabElement.querySelector('.tab-label');
            const fileName = path.split(/[\\/]/).pop();
            if (tab.modified) {
                label.textContent = fileName + ' ●';
            } else {
                label.textContent = fileName;
            }
        }
    }

    detectLanguage(path) {
        const ext = path.split('.').pop().toLowerCase();
        const languageMap = {
            'js': 'javascript',
            'jsx': 'javascript',
            'ts': 'typescript',
            'tsx': 'typescript',
            'json': 'json',
            'html': 'html',
            'css': 'css',
            'scss': 'scss',
            'py': 'python',
            'java': 'java',
            'cpp': 'cpp',
            'c': 'c',
            'cs': 'csharp',
            'php': 'php',
            'rb': 'ruby',
            'go': 'go',
            'rs': 'rust',
            'md': 'markdown',
            'xml': 'xml',
            'yaml': 'yaml',
            'yml': 'yaml',
            'sh': 'shell',
            'sql': 'sql',
            'r': 'r',
            'dart': 'dart',
            'swift': 'swift',
            'kt': 'kotlin'
        };

        return languageMap[ext] || 'plaintext';
    }

    getFileIcon(fileName) {
        const ext = fileName.split('.').pop().toLowerCase();
        const iconMap = {
            'js': '📜',
            'json': '📋',
            'html': '🌐',
            'css': '🎨',
            'md': '📝',
            'py': '🐍',
            'java': '☕',
            'cpp': '⚙️',
            'c': '⚙️',
            'ts': '📘',
            'jsx': '⚛️',
            'tsx': '⚛️',
        };

        return iconMap[ext] || '📄';
    }

    addKeyboardShortcuts() {
        // Save: Ctrl+S / Cmd+S
        this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
            this.saveFile();
        });

        // Find: Ctrl+F / Cmd+F
        this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF, () => {
            this.editor.getAction('actions.find').run();
        });

        // Replace: Ctrl+H / Cmd+H
        this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyH, () => {
            this.editor.getAction('editor.action.startFindReplaceAction').run();
        });

        // Format Document: Shift+Alt+F
        this.editor.addCommand(monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF, () => {
            this.editor.getAction('editor.action.formatDocument').run();
        });

        // Command Palette: Ctrl+Shift+P / Cmd+Shift+P
        this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyP, () => {
            this.editor.getAction('editor.action.quickCommand').run();
        });

        console.log('Keyboard shortcuts added');
    }
}

// Initialize when DOM is ready
let monacoManager;
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing Monaco Manager');
    setTimeout(() => {
        monacoManager = new MonacoEditorManager();
        window.monacoManager = monacoManager;
    }, 100);
});