'use client';

import { useCallback, useRef, useState } from 'react';
import { Download, Eye, FileText, Menu, Settings, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MarkdownEditor } from '@/components/editor/markdown-editor';
import { MarkdownPreview } from '@/components/editor/markdown-preview';
import { EditorSidebar } from '@/components/editor/editor-sidebar';
import { SettingsDrawer } from '@/components/editor/settings-drawer';
import { MarkdownToolbar } from '@/components/editor/markdown-toolbar';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { createDocument, DEFAULT_MARKDOWN, hydrateDocuments, safeFilename, transformSelection, wordStats, type MarkdownAction } from '@/lib/editor-utils';
import type { Document, EditorSettings } from '@/types/editor';

const defaults: EditorSettings = { fontSize: 16, lineHeight: 1.7, fontFamily: 'inter', wordWrap: true, spellCheck: true, autoSave: true, autoSaveInterval: 30000, showLineNumbers: false, showPreview: true, previewPosition: 'right', theme: 'system' };
const initial = [createDocument('Welcome', DEFAULT_MARKDOWN)];

export default function Home() {
  const [documents, setDocuments] = useLocalStorage<Document[]>('md-editor-documents', initial, hydrateDocuments);
  const [settings, setSettings] = useLocalStorage<EditorSettings>('md-editor-settings', defaults);
  const [activeId, setActiveId] = useState(() => documents[0]?.id ?? null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileView, setMobileView] = useState<'write' | 'preview'>('write');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const active = documents.find((doc) => doc.id === activeId) ?? documents[0];
  const stats = wordStats(active?.content ?? '');

  const update = useCallback((patch: Partial<Document>) => {
    if (!active) return;
    setDocuments((docs) => docs.map((doc) => doc.id === active.id ? { ...doc, ...patch, updatedAt: new Date() } : doc));
  }, [active, setDocuments]);
  const create = () => { const doc = createDocument(`Untitled ${documents.length + 1}`); setDocuments((docs) => [...docs, doc]); setActiveId(doc.id); setSidebarOpen(false); };
  const remove = (id: string) => { const next = documents.filter((doc) => doc.id !== id); if (!next.length) return; setDocuments(next); if (id === active?.id) setActiveId(next[0].id); };
  const command = (action: MarkdownAction) => {
    const area = textareaRef.current ?? document.querySelector<HTMLTextAreaElement>('.markdown-textarea'); if (!active || !area) return;
    const result = transformSelection(active.content, area.selectionStart, area.selectionEnd, action); update({ content: result.content });
    requestAnimationFrame(() => { area.focus(); area.setSelectionRange(result.selectionStart, result.selectionEnd); });
  };
  const exportFile = () => { if (!active) return; const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([active.content], { type: 'text/markdown' })); a.download = safeFilename(active.title); a.click(); URL.revokeObjectURL(a.href); };
  const importFile = () => { const input = document.createElement('input'); input.type='file'; input.accept='.md,text/markdown,text/plain'; input.onchange=async()=>{const file=input.files?.[0]; if(!file)return; const doc=createDocument(file.name.replace(/\.md$/i,''),await file.text()); setDocuments((d)=>[...d,doc]); setActiveId(doc.id);}; input.click(); };

  return <main className="app-shell">
    <header className="command-bar">
      <button className="brand" onClick={() => setSidebarOpen(true)} aria-label="Open documents" suppressHydrationWarning><span>MD</span><strong>Editor</strong></button>
      <div className="document-heading">{active && <><input aria-label="Document title" value={active.title} onChange={(e)=>update({title:e.target.value})}/><small><span className="saved-dot"/>Saved locally · {stats.words} words · {stats.characters} chars</small></>}</div>
      <div className="header-actions">
        <Button variant="ghost" onClick={importFile}><Upload/> <span>Import</span></Button>
        <Button variant="ghost" onClick={exportFile}><Download/> <span>Export</span></Button>
        <Button variant="ghost" onClick={()=>setSettingsOpen(true)}><Settings/> <span className="sr-only">Inspect settings</span></Button>
      </div>
    </header>
    <div className="workspace">
      <aside className="desktop-sidebar"><EditorSidebar documents={documents} activeDocumentId={active?.id ?? null} onSelectDocument={setActiveId} onCreateDocument={create} onRenameDocument={(id,title)=>setDocuments(d=>d.map(x=>x.id===id?{...x,title,updatedAt:new Date()}:x))} onDeleteDocument={remove}/></aside>
      {sidebarOpen && <div className="mobile-drawer" role="dialog" aria-modal="true" aria-label="Documents"><button className="drawer-backdrop" onClick={()=>setSidebarOpen(false)} aria-label="Close documents"/><div><EditorSidebar documents={documents} activeDocumentId={active?.id ?? null} onSelectDocument={(id)=>{setActiveId(id);setSidebarOpen(false)}} onCreateDocument={create} onRenameDocument={(id,title)=>setDocuments(d=>d.map(x=>x.id===id?{...x,title}:x))} onDeleteDocument={remove}/></div></div>}
      <section className="editor-stage">
        <div className="mobile-tabs"><button onClick={()=>setSidebarOpen(true)} aria-label="Documents"><Menu/></button><button className={mobileView==='write'?'active':''} onClick={()=>setMobileView('write')}>Write</button><button className={mobileView==='preview'?'active':''} onClick={()=>setMobileView('preview')}>Preview</button></div>
        <MarkdownToolbar onBold={()=>command('bold')} onItalic={()=>command('italic')} onStrikethrough={()=>command('strikethrough')} onCode={()=>command('code')} onCodeBlock={()=>command('codeBlock')} onLink={()=>command('link')} onImage={()=>command('link')} onHeading1={()=>command('heading1')} onHeading2={()=>command('heading2')} onHeading3={()=>command('heading3')} onQuote={()=>command('quote')} onUl={()=>command('ul')} onOl={()=>command('ol')} onTask={()=>command('task')} onHr={()=>command('hr')} onTable={()=>command('table')}/>
        {active ? <div className="panes">
          <div className={`write-pane ${mobileView==='preview'?'mobile-hidden':''}`}><div className="pane-label">WRITE <span>Markdown</span></div><MarkdownEditor content={active.content} onChange={(content)=>update({content})}/></div>
          {settings.showPreview && <div className={`preview-pane ${mobileView==='write'?'mobile-hidden':''}`}><div className="pane-label">PREVIEW <Eye/></div><MarkdownPreview content={active.content} settings={settings}/></div>}
        </div> : <div className="empty"><FileText/><h2>No document selected</h2><Button onClick={create}>Create document</Button></div>}
      </section>
    </div>
    <SettingsDrawer open={settingsOpen} onOpenChange={setSettingsOpen} settings={settings} onSettingsChange={setSettings}/>
  </main>;
}
