// AI Helper Integration with Gemini API
class AIHelper {
    constructor() {
        this.apiUrl = 'https://gemini-ask-api.onrender.com/ask';
        this.isProcessing = false;
        this.convertedCode = '';
        this.convertedLang = '';
        this.init();
    }

    init() {
        console.log('🤖 Initializing AI Helper...');
        this.setupUI();
        this.attachEventListeners();
    }

    setupUI() {
        const rightSidebar = document.querySelector('.sidebar.right');
        if (!rightSidebar) {
            console.error('Right sidebar not found!');
            return;
        }

        rightSidebar.innerHTML = `
      <div class="ai-helper-container">
        <div class="ai-header">
          <span class="ai-title">🤖 AI HELPER</span>
        </div>
        
        <div class="ai-buttons">
          <button id="ai-explain" class="ai-btn" title="Explain the current code">
            📖 Explain Code
          </button>
          
          <button id="ai-problems" class="ai-btn" title="Find issues in the code">
            🐛 Find Problems
          </button>
          
          <button id="ai-tests" class="ai-btn" title="Generate test cases">
            ✅ Generate Tests
          </button>
          
          <div class="ai-convert-section">
            <label class="ai-label">Convert to:</label>
            <div class="convert-buttons">
              <button id="ai-to-python" class="ai-btn-small" title="Convert to Python">
                🐍 Python
              </button>
              <button id="ai-to-java" class="ai-btn-small" title="Convert to Java">
                ☕ Java
              </button>
              <button id="ai-to-cpp" class="ai-btn-small" title="Convert to C++">
                ⚙️ C++
              </button>
            </div>
          </div>
        </div>
        
        <div id="ai-output" class="ai-output">
          <div class="ai-placeholder">
            <div class="ai-placeholder-icon">✨</div>
            <p>Select code and click a button to get AI assistance!</p>
            <small>Make sure you have a file open</small>
          </div>
        </div>
        
        <div id="ai-loading" class="ai-loading" style="display: none;">
          <div class="spinner"></div>
          <p>Thinking...</p>
        </div>
      </div>
    `;

        this.injectStyles();
    }

    injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
      .ai-helper-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        padding: 0;
        gap: 0;
        overflow: hidden;
      }

      .ai-header {
        padding: 10px 12px;
        border-bottom: 1px solid #1a1a1a;
        background: #0a0f1a;
        flex-shrink: 0;
      }

      .ai-title {
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.5px;
        color: #888;
      }

      .ai-buttons {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 12px;
        flex-shrink: 0;
      }

      .ai-btn {
        background: #1a2332;
        border: 1px solid #2a3f5f;
        color: #e5e7eb;
        padding: 10px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
        text-align: left;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .ai-btn:hover:not(:disabled) {
        background: #2a3f5f;
        border-color: #4a90e2;
        transform: translateY(-1px);
      }

      .ai-btn:active:not(:disabled) {
        transform: translateY(0);
      }

      .ai-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .ai-convert-section {
        margin-top: 8px;
        padding-top: 12px;
        border-top: 1px solid #1a1a1a;
      }

      .ai-label {
        font-size: 11px;
        color: #888;
        margin-bottom: 8px;
        display: block;
      }

      .convert-buttons {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 6px;
      }

      .ai-btn-small {
        background: #1a2332;
        border: 1px solid #2a3f5f;
        color: #e5e7eb;
        padding: 8px 6px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 11px;
        font-weight: 500;
        text-align: center;
        transition: all 0.2s;
      }

      .ai-btn-small:hover:not(:disabled) {
        background: #2a3f5f;
        border-color: #4a90e2;
      }

      .ai-btn-small:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .ai-output {
        flex: 1;
        background: #0a0f1a;
        border-top: 1px solid #1a1a1a;
        padding: 12px;
        overflow-y: auto;
        overflow-x: hidden;
        font-size: 12px;
        line-height: 1.6;
      }

      .ai-output::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }

      .ai-output::-webkit-scrollbar-track {
        background: transparent;
      }

      .ai-output::-webkit-scrollbar-thumb {
        background: #4a4a4a;
        border-radius: 4px;
      }

      .ai-output::-webkit-scrollbar-corner {
        background: transparent;
      }

      .ai-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        text-align: center;
        color: #666;
      }

      .ai-placeholder-icon {
        font-size: 48px;
        margin-bottom: 16px;
      }

      .ai-placeholder p {
        margin-bottom: 8px;
        color: #888;
      }

      .ai-placeholder small {
        color: #666;
        font-size: 11px;
      }

      .ai-loading {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        color: #4a90e2;
        z-index: 100;
        background: rgba(11, 25, 44, 0.95);
        padding: 20px 30px;
        border-radius: 8px;
        border: 1px solid #2a3f5f;
      }

      .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #1a2332;
        border-top-color: #4a90e2;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 12px;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      .ai-result {
        animation: fadeIn 0.3s ease;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .ai-result h3 {
        color: #4a90e2;
        font-size: 13px;
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid #1a1a1a;
      }

      .ai-result p {
        margin-bottom: 12px;
        color: #e5e7eb;
      }

      .ai-result pre {
        background: #000;
        border: 1px solid #1a1a1a;
        border-radius: 4px;
        padding: 12px;
        overflow-x: auto;
        margin: 12px 0;
        font-size: 11px;
        line-height: 1.5;
        white-space: pre;
      }

      .ai-result pre::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }

      .ai-result pre::-webkit-scrollbar-track {
        background: transparent;
      }

      .ai-result pre::-webkit-scrollbar-thumb {
        background: #4a4a4a;
        border-radius: 4px;
      }

      .ai-result code {
        color: #22c55e;
        font-family: 'Fira Code', monospace;
      }

      .ai-result ul, .ai-result ol {
        margin-left: 20px;
        margin-bottom: 12px;
      }

      .ai-result li {
        margin-bottom: 6px;
        color: #e5e7eb;
      }

      .ai-error {
        color: #ef4444;
        padding: 12px;
        background: #1a0a0a;
        border-radius: 4px;
        border: 1px solid #4a1a1a;
      }

      .ai-action-btn {
        background: #22c55e;
        border: none;
        color: white;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
        margin-top: 12px;
        transition: all 0.2s;
      }

      .ai-action-btn:hover {
        background: #16a34a;
        transform: translateY(-1px);
      }
    `;
        document.head.appendChild(style);
    }

    attachEventListeners() {
        const explainBtn = document.getElementById('ai-explain');
        const problemsBtn = document.getElementById('ai-problems');
        const testsBtn = document.getElementById('ai-tests');
        const pythonBtn = document.getElementById('ai-to-python');
        const javaBtn = document.getElementById('ai-to-java');
        const cppBtn = document.getElementById('ai-to-cpp');

        if (explainBtn) explainBtn.addEventListener('click', () => this.explainCode());
        if (problemsBtn) problemsBtn.addEventListener('click', () => this.findProblems());
        if (testsBtn) testsBtn.addEventListener('click', () => this.generateTests());
        if (pythonBtn) pythonBtn.addEventListener('click', () => this.convertCode('python'));
        if (javaBtn) javaBtn.addEventListener('click', () => this.convertCode('java'));
        if (cppBtn) cppBtn.addEventListener('click', () => this.convertCode('cpp'));
    }

    getCurrentCode() {
        // Access the global state object directly
        if (typeof state === 'undefined' || !state.editor) {
            this.showError('Please open a file first!');
            return null;
        }

        const model = state.editor.getModel();
        if (!model) {
            this.showError('No code to analyze!');
            return null;
        }

        const code = model.getValue();
        if (!code || code.trim() === '') {
            this.showError('The file is empty!');
            return null;
        }

        return code;
    }

    getFileExtension() {
        if (typeof state === 'undefined' || !state.activeTab) return 'txt';
        return state.activeTab.split('.').pop().toLowerCase();
    }

    async callGeminiAPI(question) {
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ question })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            return data.answer;
        } catch (error) {
            console.error('API call failed:', error);
            throw new Error('Failed to connect to AI service. Please try again.');
        }
    }

    setLoading(isLoading) {
        this.isProcessing = isLoading;
        const loadingEl = document.getElementById('ai-loading');
        if (loadingEl) {
            loadingEl.style.display = isLoading ? 'block' : 'none';
        }

        // Disable all buttons while processing
        document.querySelectorAll('.ai-btn, .ai-btn-small').forEach(btn => {
            btn.disabled = isLoading;
        });
    }

    showError(message) {
        const output = document.getElementById('ai-output');
        if (output) {
            output.innerHTML = `
        <div class="ai-error">
          <strong>❌ Error:</strong><br>${message}
        </div>
      `;
        }
    }

    showResult(title, content) {
        const output = document.getElementById('ai-output');
        if (output) {
            output.innerHTML = `
        <div class="ai-result">
          <h3>${title}</h3>
          ${content}
        </div>
      `;
            output.scrollTop = 0;
        }
    }

    async explainCode() {
        const code = this.getCurrentCode();
        if (!code) return;

        this.setLoading(true);

        try {
            const question = `Explain this code in simple terms for a beginner. Break it down step by step:

\`\`\`
${code}
\`\`\`

Please explain:
1. What does this code do overall?
2. How does it work step by step?
3. What are the key parts?
4. Any important concepts a beginner should understand?`;

            const answer = await this.callGeminiAPI(question);

            this.showResult('📖 Code Explanation', `<div>${this.formatAnswer(answer)}</div>`);
        } catch (error) {
            this.showError(error.message);
        } finally {
            this.setLoading(false);
        }
    }

    async findProblems() {
        const code = this.getCurrentCode();
        if (!code) return;

        const ext = this.getFileExtension();
        this.setLoading(true);

        try {
            const question = `Analyze this ${ext} code and find any problems, bugs, or issues. Explain them in simple terms:

\`\`\`
${code}
\`\`\`

Please check for:
1. Syntax errors or bugs
2. Logic problems
3. Performance issues
4. Best practice violations
5. Security concerns

Explain each issue in simple language that a beginner can understand.`;

            const answer = await this.callGeminiAPI(question);

            this.showResult('🐛 Code Analysis', `<div>${this.formatAnswer(answer)}</div>`);
        } catch (error) {
            this.showError(error.message);
        } finally {
            this.setLoading(false);
        }
    }

    async generateTests() {
        const code = this.getCurrentCode();
        if (!code) return;

        const ext = this.getFileExtension();
        this.setLoading(true);

        try {
            const question = `Generate test cases for this ${ext} code. Provide clear, simple test cases:

\`\`\`
${code}
\`\`\`

Please provide:
1. Test case descriptions (what should be tested)
2. Example inputs
3. Expected outputs
4. Edge cases to consider

Format the test cases clearly for a beginner to understand.`;

            const answer = await this.callGeminiAPI(question);

            this.showResult('✅ Test Cases', `<div>${this.formatAnswer(answer)}</div>`);
        } catch (error) {
            this.showError(error.message);
        } finally {
            this.setLoading(false);
        }
    }

    async convertCode(targetLang) {
        const code = this.getCurrentCode();
        if (!code) return;

        const ext = this.getFileExtension();
        const langNames = {
            'python': 'Python',
            'java': 'Java',
            'cpp': 'C++'
        };

        this.setLoading(true);

        try {
            const question = `Convert this ${ext} code to ${langNames[targetLang]}. Provide only the converted code with comments:

\`\`\`
${code}
\`\`\`

Important: 
- Keep the same logic and functionality
- Add comments to explain the conversion
- Use proper ${langNames[targetLang]} syntax and conventions
- Make it beginner-friendly`;

            const answer = await this.callGeminiAPI(question);

            // Extract code from the response
            const codeMatch = answer.match(/```[\w]*\n([\s\S]*?)\n```/);
            const convertedCode = codeMatch ? codeMatch[1] : answer;

            // Store the converted code
            this.convertedCode = convertedCode;
            this.convertedLang = targetLang;

            const escapedCode = this.escapeHtml(convertedCode);

            this.showResult(`🔄 Converted to ${langNames[targetLang]}`, `
        <p>Code has been converted! Click below to create a new file.</p>
        <pre><code>${escapedCode}</code></pre>
        <button class="ai-action-btn" id="create-converted-file-btn">
          📄 Create New ${langNames[targetLang]} File
        </button>
      `);

            // Add event listener after button is created
            setTimeout(() => {
                const btn = document.getElementById('create-converted-file-btn');
                if (btn) {
                    btn.addEventListener('click', () => {
                        this.createFileFromConversion();
                    });
                }
            }, 100);

        } catch (error) {
            this.showError(error.message);
        } finally {
            this.setLoading(false);
        }
    }

    async createFileFromConversion() {
        if (typeof state === 'undefined' || !state.currentFolder) {
            alert('Please open a folder first!');
            return;
        }

        if (!this.convertedCode) {
            alert('No converted code available!');
            return;
        }

        const extensions = {
            'python': '.py',
            'java': '.java',
            'cpp': '.cpp'
        };

        const currentFileName = state.activeTab ? state.activeTab.split(/[\\/]/).pop() : 'converted';
        const baseName = currentFileName.replace(/\.[^/.]+$/, '');
        const newFileName = baseName + '_converted' + extensions[this.convertedLang];

        // Use the showInputModal function if it exists
        let fileName;
        if (typeof showInputModal === 'function') {
            fileName = await showInputModal(
                'Create Converted File',
                'Enter filename',
                newFileName
            );
        } else {
            fileName = prompt('Enter filename:', newFileName);
        }

        if (!fileName) return;

        try {
            const separator = state.currentFolder.includes('\\') ? '\\' : '/';
            let fullPath = state.currentFolder;
            if (!fullPath.endsWith(separator)) {
                fullPath += separator;
            }
            fullPath += fileName;

            await window.fileSystem.writeFile(fullPath, this.convertedCode);

            // Show notification if function exists
            if (typeof showNotification === 'function') {
                showNotification(`Created: ${fileName}`);
            } else {
                alert(`File created: ${fileName}`);
            }

            // Reload file tree if function exists
            if (typeof loadFileTree === 'function') {
                await loadFileTree(state.currentFolder);
            }

            // Open the new file if function exists
            if (typeof openFile === 'function') {
                await openFile(fullPath);
            }

        } catch (error) {
            alert(`Error creating file: ${error.message}`);
        }
    }

    formatAnswer(text) {
        // Convert markdown-style formatting to HTML
        text = text.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
        text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
        text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        text = text.replace(/\n\n/g, '</p><p>');
        text = text.replace(/\n/g, '<br>');
        text = '<p>' + text + '</p>';

        return text;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize AI Helper when DOM is ready
let aiHelper;
document.addEventListener('DOMContentLoaded', () => {
    // Wait for other components to initialize
    setTimeout(() => {
        try {
            aiHelper = new AIHelper();
            window.aiHelper = aiHelper;
            console.log('✅ AI Helper ready!');
        } catch (error) {
            console.error('❌ Error initializing AI Helper:', error);
        }
    }, 1000); // Increased timeout to ensure state is available
});