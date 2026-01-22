
import { AITool } from './types';

export const AI_TOOLS: AITool[] = [
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

export const STORAGE_KEY = 'ai_hub_pro_settings_v3';

export const ACCENT_COLORS = [
  { name: 'Neon Lime', value: '#ccff00' },
  { name: 'Neon Blue', value: '#00d4ff' },
  { name: 'Neon Pink', value: '#ff007a' },
  { name: 'Neon Purple', value: '#bc13fe' },
  { name: 'Cyber Red', value: '#ff3131' },
];
