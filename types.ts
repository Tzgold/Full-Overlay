
export type ToolCategory = 'Writing & Search' | 'Image Generation' | 'Video Editing' | 'Productivity' | 'General';

export interface AITool {
  id: string;
  name: string;
  url: string;
  description: string;
  category: ToolCategory;
  icon?: string;
  isCustom?: boolean;
}

export interface AppSettings {
  enabledTools: Record<string, boolean>;
  isExtensionEnabled: boolean;
  toolOrder: string[];
  collapsedCategories: Record<string, boolean>;
  accentColor: string;
  customTools: AITool[];
}
