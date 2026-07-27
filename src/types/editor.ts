export interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface EditorSettings {
  fontSize: number;
  lineHeight: number;
  fontFamily: 'inter' | 'plus-jakarta-sans' | 'fira-code' | 'jetbrains-mono';
  wordWrap: boolean;
  spellCheck: boolean;
  autoSave: boolean;
  autoSaveInterval: number;
  showLineNumbers: boolean;
  showPreview: boolean;
  previewPosition: 'right' | 'bottom' | 'split';
  theme: 'light' | 'dark' | 'system';
  mobileView: 'write' | 'preview';
}

export interface ToolbarButton {
  id: string;
  icon: string;
  label: string;
  shortcut?: string;
  action:
    | 'bold'
    | 'italic'
    | 'strikethrough'
    | 'code'
    | 'link'
    | 'image'
    | 'heading1'
    | 'heading2'
    | 'heading3'
    | 'quote'
    | 'ul'
    | 'ol'
    | 'task'
    | 'hr'
    | 'table';
}
