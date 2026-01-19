// File Explorer Implementation
class FileExplorer {
    constructor() {
        this.currentPath = null;
        this.expandedFolders = new Set();
        this.selectedItem = null;
        this.onFileOpenCallback = null;

        this.init();
    }

    init() {
        // Get initial working directory
        window.fileSystem.getCurrentPath().then(path => {
            this.currentPath = path;
            this.loadFileTree();
        });

        // Setup event listeners
        document.getElementById('new-file-btn').addEventListener('click', () => {
            this.createNewFile();
        });

        document.getElementById('new-folder-btn').addEventListener('click', () => {
            this.createNewFolder();
        });

        document.getElementById('refresh-btn').addEventListener('click', () => {
            this.loadFileTree();
        });

        // Context menu
        document.addEventListener('click', () => {
            this.hideContextMenu();
        });
    }

    async loadFileTree(path = null) {
        const targetPath = path || this.currentPath;
        const tree = await window.fileSystem.readDirectory(targetPath);

        const container = document.getElementById('file-tree');
        container.innerHTML = '';

        this.renderTree(tree, container, targetPath);
    }

    renderTree(items, container, basePath, level = 0) {
        items.forEach(item => {
            const itemPath = `${basePath}/${item.name}`;
            const itemDiv = document.createElement('div');
            itemDiv.className = 'tree-item';
            itemDiv.style.paddingLeft = `${level * 16 + 8}px`;
            itemDiv.dataset.path = itemPath;
            itemDiv.dataset.isDirectory = item.isDirectory;

            // Toggle for folders
            if (item.isDirectory) {
                const toggle = document.createElement('span');
                toggle.className = 'tree-toggle';
                toggle.textContent = this.expandedFolders.has(itemPath) ? '▼' : '▶';
                itemDiv.appendChild(toggle);

                toggle.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggleFolder(itemPath);
                });
            } else {
                const spacer = document.createElement('span');
                spacer.className = 'tree-toggle';
                itemDiv.appendChild(spacer);
            }

            // Icon
            const icon = document.createElement('span');
            icon.className = 'tree-icon';
            icon.textContent = this.getIcon(item.name, item.isDirectory);
            itemDiv.appendChild(icon);

            // Label
            const label = document.createElement('span');
            label.className = 'tree-label';
            label.textContent = item.name;
            itemDiv.appendChild(label);

            // Click handler
            itemDiv.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectItem(itemDiv, itemPath, item.isDirectory);
            });

            // Double click to open file
            itemDiv.addEventListener('dblclick', (e) => {
                e.stopPropagation();
                if (!item.isDirectory) {
                    this.openFile(itemPath);
                } else {
                    this.toggleFolder(itemPath);
                }
            });

            // Context menu
            itemDiv.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.showContextMenu(e, itemPath, item.isDirectory);
            });

            container.appendChild(itemDiv);

            // Render children if folder is expanded
            if (item.isDirectory && this.expandedFolders.has(itemPath) && item.children) {
                const childContainer = document.createElement('div');
                childContainer.className = 'tree-children';
                container.appendChild(childContainer);
                this.renderTree(item.children, childContainer, basePath, level + 1);
            }
        });
    }

    async toggleFolder(path) {
        if (this.expandedFolders.has(path)) {
            this.expandedFolders.delete(path);
        } else {
            this.expandedFolders.add(path);
        }
        await this.loadFileTree();
    }

    selectItem(element, path, isDirectory) {
        // Remove previous selection
        document.querySelectorAll('.tree-item').forEach(item => {
            item.classList.remove('selected');
        });

        element.classList.add('selected');
        this.selectedItem = { path, isDirectory };
    }

    async openFile(path) {
        if (this.onFileOpenCallback) {
            const content = await window.fileSystem.readFile(path);
            this.onFileOpenCallback(path, content);
        }
    }

    onFileOpen(callback) {
        this.onFileOpenCallback = callback;
    }

    getIcon(name, isDirectory) {
        if (isDirectory) return '📁';

        const ext = name.split('.').pop().toLowerCase();
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
            'png': '🖼️',
            'jpg': '🖼️',
            'jpeg': '🖼️',
            'gif': '🖼️',
            'svg': '🖼️',
            'pdf': '📕',
            'txt': '📄',
            'xml': '📰',
            'sh': '🔧',
            'bat': '🔧',
        };

        return iconMap[ext] || '📄';
    }

    async createNewFile() {
        const basePath = this.selectedItem?.isDirectory
            ? this.selectedItem.path
            : this.currentPath;

        const name = await this.promptName('Enter file name:');
        if (name) {
            const filePath = `${basePath}/${name}`;
            await window.fileSystem.writeFile(filePath, '');
            await this.loadFileTree();
        }
    }

    async createNewFolder() {
        const basePath = this.selectedItem?.isDirectory
            ? this.selectedItem.path
            : this.currentPath;

        const name = await this.promptName('Enter folder name:');
        if (name) {
            const folderPath = `${basePath}/${name}`;
            await window.fileSystem.createDirectory(folderPath);
            await this.loadFileTree();
        }
    }

    async deleteItem(path) {
        if (confirm(`Are you sure you want to delete ${path}?`)) {
            await window.fileSystem.deleteItem(path);
            await this.loadFileTree();
        }
    }

    async renameItem(path) {
        const oldName = path.split('/').pop();
        const newName = await this.promptName('Enter new name:', oldName);

        if (newName && newName !== oldName) {
            const newPath = path.substring(0, path.lastIndexOf('/')) + '/' + newName;
            await window.fileSystem.renameItem(path, newPath);
            await this.loadFileTree();
        }
    }

    promptName(message, defaultValue = '') {
        return new Promise((resolve) => {
            const name = prompt(message, defaultValue);
            resolve(name);
        });
    }

    showContextMenu(event, path, isDirectory) {
        const menu = document.getElementById('context-menu');
        menu.style.display = 'block';
        menu.style.left = event.pageX + 'px';
        menu.style.top = event.pageY + 'px';

        const handleAction = (action) => {
            switch (action) {
                case 'new-file':
                    this.selectedItem = { path, isDirectory };
                    this.createNewFile();
                    break;
                case 'new-folder':
                    this.selectedItem = { path, isDirectory };
                    this.createNewFolder();
                    break;
                case 'rename':
                    this.renameItem(path);
                    break;
                case 'delete':
                    this.deleteItem(path);
                    break;
            }
            this.hideContextMenu();
        };

        // Remove old listeners
        const newMenu = menu.cloneNode(true);
        menu.parentNode.replaceChild(newMenu, menu);

        newMenu.querySelectorAll('.context-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                handleAction(item.dataset.action);
            });
        });
    }

    hideContextMenu() {
        const menu = document.getElementById('context-menu');
        menu.style.display = 'none';
    }
}

// Initialize when DOM is ready
let fileExplorer;
document.addEventListener('DOMContentLoaded', () => {
    fileExplorer = new FileExplorer();
});