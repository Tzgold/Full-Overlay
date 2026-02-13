// AI Hub Pro - Chrome Extension Popup Script

// Constants
const AI_TOOLS = [
  { id: 'chatgpt', name: 'ChatGPT', url: 'https://chatgpt.com', description: 'OpenAI Chatbot', category: 'Writing & Search', icon: 'https://www.google.com/s2/favicons?domain=chatgpt.com&sz=64' },
  { id: 'claude', name: 'Claude', url: 'https://claude.ai', description: 'Anthropic AI', category: 'Writing & Search', icon: 'https://www.google.com/s2/favicons?domain=claude.ai&sz=64' },
  { id: 'gemini', name: 'Gemini', url: 'https://gemini.google.com', description: 'Google AI', category: 'Writing & Search', icon: 'https://www.google.com/s2/favicons?domain=gemini.google.com&sz=64' },
  { id: 'perplexity', name: 'Perplexity', url: 'https://perplexity.ai', description: 'Search & Answer Engine', category: 'Writing & Search', icon: 'https://www.google.com/s2/favicons?domain=perplexity.ai&sz=64' },
  { id: 'grok', name: 'Grok', url: 'https://grok.com', description: 'xAI Platform', category: 'Writing & Search', icon: 'https://www.google.com/s2/favicons?domain=grok.com&sz=64' },
  { id: 'deepseek', name: 'DeepSeek', url: 'https://chat.deepseek.com', description: 'LLM Platform', category: 'Writing & Search', icon: 'https://www.google.com/s2/favicons?domain=deepseek.com&sz=64' },
  { id: 'midjourney', name: 'Midjourney', url: 'https://www.midjourney.com', description: 'AI Image Generation', category: 'Image Generation', icon: 'https://www.google.com/s2/favicons?domain=midjourney.com&sz=64' },
  { id: 'runway', name: 'Runway', url: 'https://runwayml.com', description: 'AI Video Editing', category: 'Video Editing', icon: 'https://www.google.com/s2/favicons?domain=runwayml.com&sz=64' },
  { id: 'notion', name: 'Notion AI', url: 'https://notion.ai', description: 'Smart Workspace', category: 'Productivity', icon: 'https://www.google.com/s2/favicons?domain=notion.ai&sz=64' },
  { id: 'fireflies', name: 'Fireflies', url: 'https://fireflies.ai', description: 'AI Meeting Assistant', category: 'Productivity', icon: 'https://www.google.com/s2/favicons?domain=fireflies.ai&sz=64' },
];

const ACCENT_COLORS = [
  { name: 'Neon Lime', value: '#ccff00' },
  { name: 'Neon Blue', value: '#00d4ff' },
  { name: 'Neon Pink', value: '#ff007a' },
  { name: 'Neon Purple', value: '#bc13fe' },
  { name: 'Cyber Red', value: '#ff3131' },
];

const STORAGE_KEY = 'ai_hub_pro_settings_v3';
const CATEGORIES = ['Writing & Search', 'Image Generation', 'Video Editing', 'Productivity', 'General'];

// State
let state = {
  enabledTools: {},
  toolOrder: AI_TOOLS.map(t => t.id),
  customTools: [],
  isExtensionEnabled: true,
  collapsedCategories: {},
  accentColor: '#ccff00',
  isLoading: true,
  highlightedId: null,
  selectedToolId: null,
  selectedToolUrl: null,
  selectedToolName: null,
  preSelectedCategory: null
};

// SVG Icons
const icons = {
  settings: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`,
  close: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>`,
  drag: `<svg fill="currentColor" viewBox="0 0 20 20"><path d="M7 7h2v2H7V7zm0 4h2v2H7v-2zm4-4h2v2h-2V7zm0 4h2v2h-2v-2zM7 15h2v2H7v-2zm4 0h2v2h-2v-2z"/></svg>`,
  copy: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>`,
  check: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>`,
  launch: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>`,
  arrow: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"/></svg>`,
  power: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 3v7M8.684 5.291A7.962 7.962 0 0112 4a8 8 0 110 16 8 8 0 01-3.316-14.709"/></svg>`,
  arrowRight: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>`,
  pin: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>`,
  pinFilled: `<svg fill="currentColor" viewBox="0 0 24 24"><path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>`,
  plus: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>`,
  trash: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>`,
  star: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>`,
  starFilled: `<svg fill="currentColor" viewBox="0 0 24 24"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>`,
};

// Utility Functions
function saveSettings() {
  const settings = {
    enabledTools: state.enabledTools,
    toolOrder: state.toolOrder,
    isExtensionEnabled: state.isExtensionEnabled,
    collapsedCategories: state.collapsedCategories,
    accentColor: state.accentColor,
    selectedToolId: state.selectedToolId,
    selectedToolUrl: state.selectedToolUrl,
    selectedToolName: state.selectedToolName,
    customTools: state.customTools
  };

  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    chrome.storage.local.set({ [STORAGE_KEY]: settings });
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }
}

async function loadSettings() {
  try {
    let settings = null;

    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      const result = await chrome.storage.local.get([STORAGE_KEY]);
      settings = result[STORAGE_KEY];
    } else {
      const localData = localStorage.getItem(STORAGE_KEY);
      if (localData) settings = JSON.parse(localData);
    }

    if (settings) {
      state.enabledTools = settings.enabledTools || {};
      state.isExtensionEnabled = settings.isExtensionEnabled !== undefined ? settings.isExtensionEnabled : true;
      state.accentColor = settings.accentColor || '#ccff00';
      if (settings.toolOrder?.length > 0) state.toolOrder = settings.toolOrder;
      if (settings.collapsedCategories) state.collapsedCategories = settings.collapsedCategories;
      state.selectedToolId = settings.selectedToolId || null;
      state.selectedToolUrl = settings.selectedToolUrl || null;
      state.selectedToolName = settings.selectedToolName || null;
      state.customTools = settings.customTools || [];
    }
  } catch (e) {
    console.error('Error loading settings:', e);
  }

  state.isLoading = false;
}

function openUrl(url) {
  if (!state.isExtensionEnabled) return;

  if (typeof chrome !== 'undefined' && chrome.windows?.create) {
    chrome.windows.create({
      url,
      type: 'popup',
      width: 1000,
      height: 800,
      focused: true
    });
  } else {
    window.open(url, '_blank', 'width=1000,height=800,scrollbars=yes,resizable=yes');
  }
}

function getSortedTools() {
  const allTools = [...AI_TOOLS, ...state.customTools];
  return state.toolOrder.map(id => allTools.find(t => t.id === id)).filter(Boolean);
}

function getCategorizedTools() {
  const groups = {};
  CATEGORIES.forEach(cat => groups[cat] = []);

  getSortedTools().forEach(tool => {
    if (groups[tool.category]) {
      groups[tool.category].push(tool);
    }
  });

  return groups;
}

function setAccentColor(color) {
  document.documentElement.style.setProperty('--accent-color', color);
}

function handleAddTool(name, url, category = 'General') {
  const id = `custom-${Date.now()}`;
  let hostname = '';
  try {
    hostname = new URL(url).hostname;
  } catch (e) {
    console.error('Invalid URL:', url);
  }
  const newTool = {
    id,
    name,
    url,
    description: 'Custom added tool',
    category,
    isCustom: true,
    icon: hostname ? `https://www.google.com/s2/favicons?domain=${hostname}&sz=64` : null
  };
  state.customTools.push(newTool);
  state.toolOrder.push(id);
  saveSettings();
  renderApp();
}

function handleDeleteTool(id) {
  if (state.selectedToolId === id) {
    state.selectedToolId = null;
    state.selectedToolUrl = null;
    state.selectedToolName = null;
  }
  state.customTools = state.customTools.filter(t => t.id !== id);
  state.toolOrder = state.toolOrder.filter(tid => tid !== id);
  delete state.enabledTools[id];
  saveSettings();
  renderApp();
}

// Render Functions
function renderApp() {
  const root = document.getElementById('root');

  if (state.isLoading) {
    root.innerHTML = `
      <div class="loading-container">
        <div class="loading-spinner"></div>
      </div>
    `;
    return;
  }

  setAccentColor(state.accentColor);

  root.innerHTML = `
    <div class="app-container">
      <div class="app-content">
        ${renderHeader()}
        ${renderToolsContainer()}
        ${renderFooter()}
      </div>
      ${renderModal()}
    </div>
  `;

  attachEventListeners();
}

function renderHeader() {
  return `
    <header class="header">
      <div style="display: flex; align-items: center;">
        <img src="icons/icon128.png" class="header-logo" alt="Overlay Logo">
        <div>
            <h1 class="header-title">OVERLAY</h1>
            <p class="header-subtitle">AI, right where you work</p>
        </div>
      </div>
      <div class="header-actions">
        <button class="settings-btn" id="addToolMainBtn" title="Add New Tool">
          ${icons.plus}
        </button>
        <button class="settings-btn" id="settingsBtn" title="System Settings">
          ${icons.settings}
        </button>
      </div>
    </header>
  `;
}

function renderToolsContainer() {
  const categorizedTools = getCategorizedTools();
  const disabledClass = !state.isExtensionEnabled ? 'disabled' : '';

  let categoriesHtml = '';

  for (const [category, tools] of Object.entries(categorizedTools)) {
    if (tools.length === 0) continue;

    const isCollapsed = state.collapsedCategories[category];
    const arrowClass = isCollapsed ? 'collapsed' : '';

    let toolsHtml = '';
    if (!isCollapsed) {
      toolsHtml = `
        <div class="category-tools">
          ${tools.map(tool => renderToolItem(tool)).join('')}
        </div>
      `;
    }

    categoriesHtml += `
      <div class="category" data-category="${category}">
        <button class="category-header" data-toggle-category="${category}">
          <div class="category-header-content">
            <span class="category-title">${category}</span>
            <div class="category-line"></div>
          </div>
          <svg class="category-arrow ${arrowClass}">${icons.arrow}</svg>
        </button>
        ${toolsHtml}
      </div>
    `;
  }

  return `
    <div class="tools-container ${disabledClass}" id="toolsContainer">
      <div class="tools-list">
        ${categoriesHtml}
      </div>
    </div>
  `;
}

function renderToolItem(tool) {
  const enabled = state.enabledTools[tool.id] || false;
  const isHighlighted = state.highlightedId === tool.id;
  const isSelected = state.selectedToolId === tool.id;
  const highlightClass = isHighlighted ? 'animate-neon-flash' : '';
  const disabledClass = !state.isExtensionEnabled ? 'disabled' : '';
  const selectedClass = isSelected ? 'selected-tool' : '';

  const iconContent = tool.icon
    ? `<img src="${tool.icon}" alt="${tool.name}">`
    : `<span class="tool-icon-fallback">${tool.name[0]}</span>`;

  const favIcon = isSelected ? icons.pinFilled : icons.pin;
  const favClass = isSelected ? 'favourite' : '';

  return `
    <div class="tool-item ${highlightClass} ${disabledClass} ${selectedClass}" data-tool-id="${tool.id}">
      <div class="tool-left">
        <div class="drag-handle" draggable="true" data-drag-id="${tool.id}">
          ${icons.drag}
        </div>
        <div class="tool-icon">
          ${iconContent}
        </div>
        <div class="tool-info">
          <div style="display: flex; align-items: center; gap: 6px;">
            <h3 class="tool-name">${tool.name}</h3>
            ${isSelected ? `<span class="quick-tool-badge" style="background-color: ${state.accentColor}">★ QUICK</span>` : ''}
          </div>
          <p class="tool-description">${tool.isCustom ? 'User Added' : tool.description}</p>
        </div>
      </div>
      <div class="tool-right">
        ${tool.isCustom ? `
          <button class="tool-btn delete" data-delete-id="${tool.id}" title="Delete Tool">
            ${icons.trash}
          </button>
        ` : ''}
        <button class="tool-btn" data-copy-url="${tool.url}" title="Copy URL">
          ${icons.copy}
        </button>
        <button class="tool-btn launch" data-launch-id="${tool.id}" data-launch-url="${tool.url}" title="Launch Tool">
          ${icons.launch}
        </button>
        <button class="fav-toggle ${favClass}" data-fav-id="${tool.id}" data-fav-url="${tool.url}" data-fav-name="${tool.name}" title="${isSelected ? 'Remove as Quick Tool' : 'Set as Quick Tool (Alt+A)'}">
          ${favIcon}
        </button>
        <button class="toggle-switch ${enabled ? 'enabled' : ''}" data-toggle-tool="${tool.id}">
          <span class="toggle-knob"></span>
        </button>
      </div>
    </div>
  `;
}

function renderFooter() {
  const powerEnabledClass = state.isExtensionEnabled ? 'enabled' : '';
  const launchEnabledClass = state.isExtensionEnabled ? 'enabled' : '';
  const disabledAttr = !state.isExtensionEnabled ? 'disabled' : '';

  return `
    <div class="footer">
      <div class="footer-buttons">
        <button class="footer-btn" id="selectAllBtn" ${disabledAttr}>SELECT ALL</button>
        <button class="footer-btn" id="clearAllBtn" ${disabledAttr}>CLEAR ALL</button>
      </div>
      <div class="power-container">
        <button class="power-btn ${powerEnabledClass}" id="powerBtn" style="${state.isExtensionEnabled ? `background-color: ${state.accentColor}; box-shadow: 0 0 12px ${state.accentColor}4d;` : ''}">
          ${icons.power}
        </button>
        <span class="power-status ${powerEnabledClass}" style="${state.isExtensionEnabled ? `color: ${state.accentColor};` : ''}">
          ${state.isExtensionEnabled ? 'SYSTEM ONLINE' : 'SYSTEM OFFLINE'}
        </span>
      </div>
      <button class="launch-btn ${launchEnabledClass}" id="launchAllBtn" ${disabledAttr}>
        <span>Desktop Dashboard</span>
        ${icons.arrowRight}
      </button>
    </div>
  `;
}

function renderModal() {
  const colorsHtml = ACCENT_COLORS.map(c => `
    <button 
      class="color-option ${state.accentColor === c.value ? 'selected' : ''}" 
      data-color="${c.value}"
      style="background-color: ${c.value}"
      title="${c.name}"
    ></button>
  `).join('');

  return `
    <div class="modal-overlay hidden" id="modalOverlay">
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">System Settings</h2>
          <button class="modal-close" id="modalClose">
            ${icons.close}
          </button>
        </div>
        <div class="modal-content">
          <div class="modal-sections">
            <section class="modal-section">
              <h3>Add Custom Tool</h3>
              <form id="addToolForm" class="add-tool-form">
                <div class="form-row">
                  <input type="text" id="toolName" placeholder="Tool Name (e.g. DeepL)" required class="form-input">
                  <select id="toolCategory" class="form-input">
                    ${CATEGORIES.map(cat => `<option value="${cat}" ${state.preSelectedCategory === cat ? 'selected' : ''}>${cat}</option>`).join('')}
                  </select>
                </div>
                <div class="form-row">
                  <input type="url" id="toolUrl" placeholder="https://..." required class="form-input" style="flex: 1;">
                  <button type="submit" class="submit-btn" style="background-color: var(--accent-color)">Add</button>
                </div>
              </form>
            </section>

            <section class="modal-section">
              <h3>Accent Theme</h3>
              <div class="color-picker">
                ${colorsHtml}
              </div>
            </section>
            
            <section class="modal-section">
              <h3>Keyboard Shortcuts</h3>
              <div class="shortcuts-list">
                <div class="shortcut-item">
                  <span class="shortcut-name">Show/Toggle Quick Tool Overlay</span>
                  <span class="shortcut-key">Alt + A</span>
                </div>

              </div>
            </section>
            
            <section class="modal-section">
              <h3>Advanced Config</h3>
              <p>System V3.2. Launches tools in 1000x800 popup windows. Reorder via drag & drop. Persists to local storage.</p>
            </section>
            
            <button class="close-settings-btn" id="closeSettingsBtn" style="background-color: ${state.accentColor}">
              Close Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Event Handlers
function attachEventListeners() {
  // Settings button
  document.getElementById('settingsBtn')?.addEventListener('click', () => {
    document.getElementById('modalOverlay')?.classList.remove('hidden');
  });

  // Add Tool Main button
  document.getElementById('addToolMainBtn')?.addEventListener('click', () => {
    document.getElementById('modalOverlay')?.classList.remove('hidden');
    // Scroll to the add form inside modal if it's long
    document.getElementById('addToolForm')?.scrollIntoView({ behavior: 'smooth' });
  });

  // Modal close
  document.getElementById('modalClose')?.addEventListener('click', closeModal);
  document.getElementById('closeSettingsBtn')?.addEventListener('click', closeModal);
  document.getElementById('modalOverlay')?.addEventListener('click', (e) => {
    if (e.target.id === 'modalOverlay') closeModal();
  });

  // Add Tool Form
  const addToolForm = document.getElementById('addToolForm');
  if (addToolForm) {
    addToolForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('toolName').value;
      const url = document.getElementById('toolUrl').value;
      const category = document.getElementById('toolCategory').value;
      if (name && url) {
        handleAddTool(name, url, category);
        closeModal();
      }
    });
  }

  // Tool delete buttons
  document.querySelectorAll('[data-delete-id]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const toolId = btn.dataset.deleteId;
      if (confirm('Are you sure you want to delete this tool?')) {
        handleDeleteTool(toolId);
      }
    });
  });

  // Color picker
  document.querySelectorAll('.color-option').forEach(btn => {
    btn.addEventListener('click', () => {
      const color = btn.dataset.color;
      state.accentColor = color;
      saveSettings();
      renderApp();
    });
  });

  // Power button
  document.getElementById('powerBtn')?.addEventListener('click', () => {
    state.isExtensionEnabled = !state.isExtensionEnabled;
    saveSettings();
    renderApp();
  });

  // Select all / Clear all
  document.getElementById('selectAllBtn')?.addEventListener('click', () => {
    const allTools = [...AI_TOOLS, ...state.customTools];
    allTools.forEach(t => state.enabledTools[t.id] = true);
    saveSettings();
    renderApp();
  });

  document.getElementById('clearAllBtn')?.addEventListener('click', () => {
    state.enabledTools = {};
    saveSettings();
    renderApp();
  });

  // Desktop Dashboard
  document.getElementById('launchAllBtn')?.addEventListener('click', () => {
    if (!state.isExtensionEnabled) return;
    chrome.tabs.create({ url: 'popup.html' });
  });

  // Category toggles
  document.querySelectorAll('[data-toggle-category]').forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.toggleCategory;
      state.collapsedCategories[category] = !state.collapsedCategories[category];
      saveSettings();
      renderApp();
    });
  });

  // Tool toggles
  document.querySelectorAll('[data-toggle-tool]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const toolId = btn.dataset.toggleTool;
      state.enabledTools[toolId] = !state.enabledTools[toolId];
      saveSettings();
      renderApp();
    });
  });

  // Copy URL buttons
  document.querySelectorAll('[data-copy-url]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const url = btn.dataset.copyUrl;
      navigator.clipboard.writeText(url).then(() => {
        btn.innerHTML = icons.check;
        btn.classList.add('copied');
        setTimeout(() => {
          btn.innerHTML = icons.copy;
          btn.classList.remove('copied');
        }, 2000);
      });
    });
  });

  // Favourite toggle (set quick tool for Alt+A)
  document.querySelectorAll('[data-fav-id]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const toolId = btn.dataset.favId;
      const toolUrl = btn.dataset.favUrl;
      const toolName = btn.dataset.favName;

      // Toggle off if already selected
      if (state.selectedToolId === toolId) {
        state.selectedToolId = null;
        state.selectedToolUrl = null;
        state.selectedToolName = null;
      } else {
        state.selectedToolId = toolId;
        state.selectedToolUrl = toolUrl;
        state.selectedToolName = toolName;
      }
      saveSettings();
      renderApp();
    });
  });

  // Launch buttons
  document.querySelectorAll('[data-launch-id]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const toolId = btn.dataset.launchId;
      const url = btn.dataset.launchUrl;
      state.highlightedId = toolId;
      renderApp();
      openUrl(url);
      setTimeout(() => {
        state.highlightedId = null;
        renderApp();
      }, 1200);
    });
  });

  // Drag and drop
  setupDragAndDrop();

  // Keyboard shortcuts
  document.addEventListener('keydown', handleKeyDown);
}

function closeModal() {
  document.getElementById('modalOverlay')?.classList.add('hidden');
}

function handleKeyDown(e) {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

  if (cmdOrCtrl && e.shiftKey) {
    if (e.key.toUpperCase() === 'P') {
      e.preventDefault();
      state.isExtensionEnabled = !state.isExtensionEnabled;
      saveSettings();
      renderApp();
    } else if (e.key.toUpperCase() === 'L') {
      e.preventDefault();
      if (state.isExtensionEnabled) {
        const allTools = [...AI_TOOLS, ...state.customTools];
        allTools.forEach(t => {
          if (state.enabledTools[t.id]) {
            openUrl(t.url);
          }
        });
      }
    }
  }
}

// Drag and Drop
let draggedId = null;

function setupDragAndDrop() {
  document.querySelectorAll('[data-drag-id]').forEach(handle => {
    handle.addEventListener('dragstart', (e) => {
      draggedId = handle.dataset.dragId;
      e.target.closest('.tool-item')?.classList.add('dragging');
    });

    handle.addEventListener('dragend', () => {
      document.querySelectorAll('.tool-item').forEach(item => {
        item.classList.remove('dragging');
      });
      draggedId = null;
    });
  });

  document.querySelectorAll('.tool-item').forEach(item => {
    item.addEventListener('dragover', (e) => {
      e.preventDefault();
    });

    item.addEventListener('drop', (e) => {
      e.preventDefault();
      const targetId = item.dataset.toolId;

      if (draggedId && targetId && draggedId !== targetId) {
        const oldIdx = state.toolOrder.indexOf(draggedId);
        const newIdx = state.toolOrder.indexOf(targetId);

        if (oldIdx !== -1 && newIdx !== -1) {
          state.toolOrder.splice(oldIdx, 1);
          state.toolOrder.splice(newIdx, 0, draggedId);
          saveSettings();
          renderApp();
        }
      }
    });
  });
}

// Initialize
async function init() {
  await loadSettings();
  renderApp();
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
