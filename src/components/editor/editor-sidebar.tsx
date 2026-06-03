'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  FileText,
  FolderOpen,
  Plus,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Document } from '@/types/editor';

interface EditorSidebarProps {
  documents: Document[];
  activeDocumentId: string | null;
  onSelectDocument: (id: string) => void;
  onCreateDocument: () => void;
  onRenameDocument: (id: string, title: string) => void;
  onDeleteDocument: (id: string) => void;
  className?: string;
}

export function EditorSidebar({
  documents,
  activeDocumentId,
  onSelectDocument,
  onCreateDocument,
  onRenameDocument,
  onDeleteDocument,
  className,
}: EditorSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const filteredDocuments = documents.filter((doc) =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartRename = (doc: Document) => {
    setRenamingId(doc.id);
    setRenameValue(doc.title);
  };

  const handleFinishRename = () => {
    if (renamingId && renameValue.trim()) {
      onRenameDocument(renamingId, renameValue.trim());
    }
    setRenamingId(null);
    setRenameValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleFinishRename();
    } else if (e.key === 'Escape') {
      setRenamingId(null);
      setRenameValue('');
    }
  };

  const handleDelete = (e: React.MouseEvent, docId: string) => {
    e.stopPropagation();
    if (documents.length <= 1) {
      // Don't delete the last document
      return;
    }
    onDeleteDocument(docId);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={cn('flex flex-col border-r bg-card', className)}>
      <div className="flex items-center gap-2 border-b p-3">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8"
          />
        </div>
        <Tooltip>
          <TooltipTrigger >
            <Button
              variant="ghost"
              size="sm"
              onClick={onCreateDocument}
              className="h-8 w-8 p-0"
            >
              <Plus size={18} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>New Document</TooltipContent>
        </Tooltip>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredDocuments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FolderOpen size={40} className="text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                {searchQuery ? 'No documents found' : 'No documents yet'}
              </p>
              {!searchQuery && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={onCreateDocument}
                  className="mt-2"
                >
                  Create your first document
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredDocuments.map((doc) => (
                <div key={doc.id}>
                  <div
                    className={cn(
                      'group flex items-center gap-2 rounded-md px-2 py-2 cursor-pointer transition-colors',
                      activeDocumentId === doc.id
                        ? 'bg-accent text-accent-foreground'
                        : 'hover:bg-accent/50'
                    )}
                    onClick={() => onSelectDocument(doc.id)}
                  >
                    <FileText size={18} className="text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      {renamingId === doc.id ? (
                        <Input
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyDown={handleKeyDown}
                          onBlur={handleFinishRename}
                          className="h-6 text-sm"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <p className="text-sm font-medium truncate">{doc.title}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {formatDate(doc.updatedAt)}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical size={14} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleStartRename(doc)}>
                          <Pencil size={14} className="mr-2" />
                          Rename
                        </DropdownMenuItem>
                        {documents.length > 1 && (
                          <DropdownMenuItem
                            onClick={(e) => handleDelete(e, doc.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 size={14} className="mr-2" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      <Separator />

      <div className="p-2">
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger >
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 h-8"
                onClick={onCreateDocument}
              >
                <Plus size={16} className="mr-2" />
                New
              </Button>
            </TooltipTrigger>
            <TooltipContent>New Document</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
