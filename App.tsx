
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AI_TOOLS, STORAGE_KEY, ACCENT_COLORS } from './constants';
import { AITool, ToolCategory } from './types';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

declare const chrome: any;

const SETTINGS_KEY = STORAGE_KEY;

// Modal Component
const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
      <div className="bg-zinc-950 border border-zinc-800 w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-4 border-b border-zinc-900 flex items-center justify-between">
          <h2 className="text-sm font-bold tracking-tight uppercase">{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-zinc-900 rounded-md transition-colors text-zinc-500 hover:text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-5 max-h-[400px] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

// Toggle Component
const ToggleSwitch: React.FC<{ enabled: boolean; onToggle: (e: React.MouseEvent) => void; accentColor: string }> = ({ enabled, onToggle, accentColor }) => {
  return (
    <button
      onClick={onToggle}
      className={`relative inline-flex h-5 w-9 items-center rounded-full border-2 border-transparent transition-colors ${enabled ? 'opacity-100' : 'bg-zinc-700'}`}
      style={{ backgroundColor: enabled ? accentColor : undefined }}
    >
      <span className={`block h-4 w-4 rounded-full bg-white shadow-lg transition-transform ${enabled ? 'translate-x-4' : 'translate-x-0'}`} />
    </button>
  );
};

// Power Button
const MasterPowerButton: React.FC<{ enabled: boolean; onToggle: () => void; accentColor: string }> = ({ enabled, onToggle, accentColor }) => (
  <div className="flex flex-col items-center justify-center py-1">
    <button
      onClick={onToggle}
      className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border border-zinc-800 group ${enabled ? 'active:scale-90' : 'bg-zinc-900 hover:bg-zinc-800 active:scale-90'}`}
      style={{ 
        backgroundColor: enabled ? accentColor : undefined,
        boxShadow: enabled ? `0 0 12px ${accentColor}4d` : undefined
      }}
    >
      <svg className={`w-5 h-5 transition-colors duration-300 ${enabled ? 'text-black' : 'text-zinc-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 3v7M8.684 5.291A7.962 7.962 0 0112 4a8 8 0 110 16 8 8 0 01-3.316-14.709" />
      </svg>
    </button>
    <span className="text-[8px] mt-1 font-black uppercase tracking-[0.2em] transition-colors" style={{ color: enabled ? accentColor : '#3f3f46' }}>
      {enabled ? 'SYSTEM ONLINE' : 'SYSTEM OFFLINE'}
    </span>
  </div>
);

// Tool Item
const ToolItem: React.FC<{ tool: AITool; enabled: boolean; isHighlighted: boolean; onToggle: (id: string) => void; onLaunch: (id: string, url: string) => void; masterDisabled: boolean; accentColor: string }> = ({ tool, enabled, isHighlighted, onToggle, onLaunch, masterDisabled, accentColor }) => {
  const [copied, setCopied] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: tool.id, disabled: masterDisabled });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : 'auto' };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(tool.url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div ref={setNodeRef} style={style} className={`group flex items-center justify-between p-2.5 rounded-xl border border-zinc-800/50 bg-zinc-900/40 transition-all duration-300 ${masterDisabled ? 'opacity-30 grayscale pointer-events-none' : ''} ${isDragging ? 'bg-zinc-800 border-zinc-700 shadow-2xl scale-[1.01]' : isHighlighted ? 'animate-neon-flash' : 'hover:border-zinc-700/80 hover:bg-zinc-900/60'}`}>
      <div className="flex items-center space-x-3 overflow-hidden">
        <div {...attributes} {...listeners} className="cursor-grab p-1 text-zinc-700 hover:text-zinc-500 transition-colors shrink-0">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M7 7h2v2H7V7zm0 4h2v2H7v-2zm4-4h2v2h-2V7zm0 4h2v2h-2v-2zM7 15h2v2H7v-2zm4 0h2v2h-2v-2z" /></svg>
        </div>
        <div className="w-8 h-8 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950 flex items-center justify-center shrink-0">
          {tool.icon ? <img src={tool.icon} alt={tool.name} className="w-5 h-5 object-contain" /> : <span className="text-xs font-bold text-zinc-500">{tool.name[0]}</span>}
        </div>
        <div className="overflow-hidden">
          <h3 className="text-[13px] font-semibold text-zinc-200 truncate leading-none mb-1">{tool.name}</h3>
          <p className="text-[9px] text-zinc-600 font-medium truncate uppercase tracking-widest">{tool.description}</p>
        </div>
      </div>
      <div className="flex items-center space-x-1 ml-2 shrink-0">
        <button onClick={handleCopy} className={`p-1 rounded-md transition-all ${copied ? '' : 'text-zinc-700 hover:text-zinc-200 hover:bg-zinc-800'}`} style={{ color: copied ? accentColor : undefined }} title="Copy URL">
          {copied ? <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg> : <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>}
        </button>
        <button onClick={() => onLaunch(tool.id, tool.url)} className="p-1 rounded-md hover:bg-zinc-800 text-zinc-600 hover:text-zinc-200 transition-all" title="Launch Tool">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
        </button>
        <ToggleSwitch enabled={enabled} onToggle={(e) => { e.stopPropagation(); onToggle(tool.id); }} accentColor={accentColor} />
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [enabledTools, setEnabledTools] = useState<Record<string, boolean>>({});
  const [toolOrder, setToolOrder] = useState<string[]>(AI_TOOLS.map(t => t.id));
  const [isExtensionEnabled, setIsExtensionEnabled] = useState(true);
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [accentColor, setAccentColor] = useState('#ccff00');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const sortedTools = useMemo(() => [...toolOrder].map(id => AI_TOOLS.find(t => t.id === id)!).filter(Boolean), [toolOrder]);
  const categorizedTools = useMemo(() => {
    const groups: Record<ToolCategory, AITool[]> = { 'Writing & Search': [], 'Image Generation': [], 'Video Editing': [], 'Productivity': [], 'General': [] };
    sortedTools.forEach(tool => groups[tool.category].push(tool));
    return groups;
  }, [sortedTools]);

  const saveSettings = useCallback((newEnabled: Record<string, boolean>, newOrder: string[], masterEnabled: boolean, collapsed: Record<string, boolean>, color: string) => {
    const settings = { enabledTools: newEnabled, toolOrder: newOrder, isExtensionEnabled: masterEnabled, collapsedCategories: collapsed, accentColor: color };
    try {
      if (typeof chrome !== 'undefined' && chrome.storage?.local) chrome.storage.local.set({ [SETTINGS_KEY]: settings });
      else localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) { console.error(e); }
  }, []);

  const openUrl = useCallback((url: string) => {
    if (!isExtensionEnabled) return;
    
    // Launch as a popup window so the user stays on their current page
    if (typeof chrome !== 'undefined' && chrome.windows?.create) {
      chrome.windows.create({
        url,
        type: 'popup',
        width: 1000,
        height: 800,
        focused: true
      });
    } else {
      // Fallback for non-extension environments
      window.open(url, '_blank', 'width=1000,height=800,scrollbars=yes,resizable=yes');
    }
  }, [isExtensionEnabled]);

  const handleLaunchAll = useCallback(() => {
    if (!isExtensionEnabled) return;
    AI_TOOLS.forEach(t => enabledTools[t.id] && openUrl(t.url));
  }, [isExtensionEnabled, enabledTools, openUrl]);

  const handleToggleMaster = useCallback(() => {
    const val = !isExtensionEnabled;
    setIsExtensionEnabled(val);
    saveSettings(enabledTools, toolOrder, val, collapsedCategories, accentColor);
  }, [isExtensionEnabled, enabledTools, toolOrder, collapsedCategories, accentColor, saveSettings]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        let settings: any = null;
        if (typeof chrome !== 'undefined' && chrome.storage?.local) {
          const result = await chrome.storage.local.get([SETTINGS_KEY]);
          settings = result[SETTINGS_KEY];
        } else {
          const localData = localStorage.getItem(SETTINGS_KEY);
          if (localData) settings = JSON.parse(localData);
        }
        if (settings) {
          setEnabledTools(settings.enabledTools || {});
          setIsExtensionEnabled(settings.isExtensionEnabled !== undefined ? settings.isExtensionEnabled : true);
          setAccentColor(settings.accentColor || '#ccff00');
          if (settings.toolOrder?.length > 0) setToolOrder(settings.toolOrder);
          if (settings.collapsedCategories) setCollapsedCategories(settings.collapsedCategories);
        }
      } catch (e) { console.error(e); } finally { setIsLoading(false); }
    };
    loadSettings();
  }, []);

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (cmdOrCtrl && e.shiftKey) {
        if (e.key.toUpperCase() === 'P') {
          e.preventDefault();
          handleToggleMaster();
        } else if (e.key.toUpperCase() === 'L') {
          e.preventDefault();
          handleLaunchAll();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleToggleMaster, handleLaunchAll]);

  const handleToggleCategory = (cat: string) => { const next = { ...collapsedCategories, [cat]: !collapsedCategories[cat] }; setCollapsedCategories(next); saveSettings(enabledTools, toolOrder, isExtensionEnabled, next, accentColor); };
  const handleToggle = (id: string) => { const next = { ...enabledTools, [id]: !enabledTools[id] }; setEnabledTools(next); saveSettings(next, toolOrder, isExtensionEnabled, collapsedCategories, accentColor); };
  const handleColorChange = (color: string) => { setAccentColor(color); saveSettings(enabledTools, toolOrder, isExtensionEnabled, collapsedCategories, color); };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIdx = toolOrder.indexOf(active.id as string);
      const newIdx = toolOrder.indexOf(over.id as string);
      const nextOrder = arrayMove(toolOrder, oldIdx, newIdx);
      setToolOrder(nextOrder);
      saveSettings(enabledTools, nextOrder, isExtensionEnabled, collapsedCategories, accentColor);
    }
  };

  if (isLoading) return <div className="flex h-[600px] w-full items-center justify-center bg-[#09090b]"><div className="h-6 w-6 border-2 border-zinc-800 border-t-[#ccff00] rounded-full animate-spin"></div></div>;

  return (
    <div className="flex flex-col h-[600px] w-full bg-[#09090b] text-zinc-100 overflow-hidden">
      <div className="flex flex-col h-full p-5 pt-4">
        <header className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">AI HUB <span style={{ color: accentColor }} className="font-black italic">PRO</span></h1>
            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.2em] mt-0.5">Unified Command</p>
          </div>
          <button onClick={() => setIsSettingsOpen(true)} className="h-7 w-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </button>
        </header>

        <div className={`flex-1 overflow-y-auto pr-1 -mr-1 mb-2 custom-scrollbar transition-opacity duration-500 ${!isExtensionEnabled ? 'opacity-20 pointer-events-none' : ''}`}>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <div className="space-y-5 pb-1">
              {(Object.entries(categorizedTools) as [ToolCategory, AITool[]][]).map(([category, tools]) => {
                if (tools.length === 0) return null;
                const isCollapsed = !!collapsedCategories[category];
                return (
                  <div key={category} className="space-y-2">
                    <button onClick={() => handleToggleCategory(category)} className="w-full flex items-center justify-between group transition-all">
                      <div className="flex items-center space-x-2">
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600 group-hover:text-zinc-400 transition-colors">{category}</span>
                        <div className="h-px w-4 bg-zinc-800 group-hover:bg-zinc-700"></div>
                      </div>
                      <svg className={`w-3 h-3 text-zinc-800 transition-transform duration-300 ${isCollapsed ? '-rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {!isCollapsed && (
                      <SortableContext items={tools.map(t => t.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-1.5">{tools.map(tool => <ToolItem key={tool.id} tool={tool} enabled={!!enabledTools[tool.id]} isHighlighted={highlightedId === tool.id} onToggle={handleToggle} onLaunch={(id, url) => { setHighlightedId(id); openUrl(url); setTimeout(() => setHighlightedId(null), 1200); }} masterDisabled={!isExtensionEnabled} accentColor={accentColor} />)}</div>
                      </SortableContext>
                    )}
                  </div>
                );
              })}
            </div>
          </DndContext>
        </div>

        <div className="mt-auto space-y-2 pt-2 border-t border-zinc-900/50">
          <div className="flex items-center justify-between gap-2">
            <button disabled={!isExtensionEnabled} onClick={() => { const next = AI_TOOLS.reduce((a, t) => ({...a, [t.id]: true}), {}); setEnabledTools(next); saveSettings(next, toolOrder, isExtensionEnabled, collapsedCategories, accentColor); }} className="flex-1 py-1 text-[8px] font-black uppercase tracking-[0.2em] text-zinc-600 hover:text-zinc-300 bg-transparent border border-zinc-900 hover:border-zinc-800 rounded transition-all disabled:opacity-20">SELECT ALL</button>
            <button disabled={!isExtensionEnabled} onClick={() => { setEnabledTools({}); saveSettings({}, toolOrder, isExtensionEnabled, collapsedCategories, accentColor); }} className="flex-1 py-1 text-[8px] font-black uppercase tracking-[0.2em] text-zinc-600 hover:text-zinc-300 bg-transparent border border-zinc-900 hover:border-zinc-800 rounded transition-all disabled:opacity-20">CLEAR ALL</button>
          </div>
          <MasterPowerButton enabled={isExtensionEnabled} onToggle={handleToggleMaster} accentColor={accentColor} />
          <button 
            disabled={!isExtensionEnabled} 
            onClick={handleLaunchAll} 
            className="group w-full h-10 font-bold rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 active:scale-[0.98]" 
            style={{ 
              backgroundColor: isExtensionEnabled ? 'white' : '#18181b', 
              color: isExtensionEnabled ? 'black' : '#3f3f46',
              boxShadow: isExtensionEnabled ? '0 4px 12px rgba(255,255,255,0.05)' : undefined
            }}
          >
            <span className="text-xs">Launch Selected Tools</span>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        </div>
      </div>

      <Modal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} title="System Settings">
        <div className="space-y-6">
          <section>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">Accent Theme</h3>
            <div className="flex flex-wrap gap-2">
              {ACCENT_COLORS.map(c => (
                <button 
                  key={c.value} 
                  onClick={() => handleColorChange(c.value)} 
                  className={`w-8 h-8 rounded-full border-2 transition-all ${accentColor === c.value ? 'border-white scale-110' : 'border-transparent'}`} 
                  style={{ backgroundColor: c.value }} 
                  title={c.name}
                />
              ))}
            </div>
          </section>
          
          <section>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">Keyboard Shortcuts</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded bg-zinc-900/50 border border-zinc-900">
                <span className="text-[10px] text-zinc-400 font-medium">Toggle Master Power</span>
                <span className="text-[10px] text-zinc-100 font-bold bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700">Ctrl + Shift + P</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-zinc-900/50 border border-zinc-900">
                <span className="text-[10px] text-zinc-400 font-medium">Launch Selected</span>
                <span className="text-[10px] text-zinc-100 font-bold bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700">Ctrl + Shift + L</span>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">Advanced Config</h3>
            <p className="text-[10px] text-zinc-600 leading-relaxed">System V3.2. Launches tools in 1000x800 popup windows. Reorder via drag & drop. Persists to local storage.</p>
          </section>
          <button onClick={() => setIsSettingsOpen(false)} className="w-full py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest transition-all" style={{ backgroundColor: accentColor, color: 'black' }}>Close Settings</button>
        </div>
      </Modal>
    </div>
  );
};

export default App;
