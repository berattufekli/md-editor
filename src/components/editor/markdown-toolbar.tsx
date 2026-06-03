'use client';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Link,
  FileImage,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  CheckSquare,
  Minus,
  Table2,
  SquareCode,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToolbarProps {
  onBold: () => void;
  onItalic: () => void;
  onStrikethrough: () => void;
  onCode: () => void;
  onCodeBlock: () => void;
  onLink: () => void;
  onImage: () => void;
  onHeading1: () => void;
  onHeading2: () => void;
  onHeading3: () => void;
  onQuote: () => void;
  onUl: () => void;
  onOl: () => void;
  onTask: () => void;
  onHr: () => void;
  onTable: () => void;
  className?: string;
}

interface ToolbarButtonProps {
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  onClick: () => void;
  disabled?: boolean;
}

function ToolbarButton({ icon, label, shortcut, onClick, disabled }: ToolbarButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger >
        <Button
          variant="ghost"
          size="sm"
          onClick={onClick}
          disabled={disabled}
          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
        >
          {icon}
          <span className="sr-only">{label}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="flex items-center gap-2">
        <span>{label}</span>
        {shortcut && (
          <kbd className="text-muted-foreground">{shortcut}</kbd>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

export function MarkdownToolbar({
  onBold,
  onItalic,
  onStrikethrough,
  onCode,
  onCodeBlock,
  onLink,
  onImage,
  onHeading1,
  onHeading2,
  onHeading3,
  onQuote,
  onUl,
  onOl,
  onTask,
  onHr,
  onTable,
  className,
}: ToolbarProps) {
  return (
    <div className={cn('flex items-center gap-0.5 border-b p-2', className)}>
      <div className="flex items-center gap-0.5">
        <ToolbarButton
          icon={<Bold size={18} />}
          label="Bold"
          shortcut="Ctrl+B"
          onClick={onBold}
        />
        <ToolbarButton
          icon={<Italic size={18} />}
          label="Italic"
          shortcut="Ctrl+I"
          onClick={onItalic}
        />
        <ToolbarButton
          icon={<Strikethrough size={18} />}
          label="Strikethrough"
          onClick={onStrikethrough}
        />
      </div>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <div className="flex items-center gap-0.5">
        <ToolbarButton
          icon={<Heading1 size={18} />}
          label="Heading 1"
          onClick={onHeading1}
        />
        <ToolbarButton
          icon={<Heading2 size={18} />}
          label="Heading 2"
          onClick={onHeading2}
        />
        <ToolbarButton
          icon={<Heading3 size={18} />}
          label="Heading 3"
          onClick={onHeading3}
        />
      </div>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <div className="flex items-center gap-0.5">
        <ToolbarButton
          icon={<Quote size={18} />}
          label="Quote"
          onClick={onQuote}
        />
        <ToolbarButton
          icon={<List size={18} />}
          label="Bullet List"
          onClick={onUl}
        />
        <ToolbarButton
          icon={<ListOrdered size={18} />}
          label="Numbered List"
          onClick={onOl}
        />
        <ToolbarButton
          icon={<CheckSquare size={18} />}
          label="Task List"
          onClick={onTask}
        />
      </div>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <div className="flex items-center gap-0.5">
        <ToolbarButton
          icon={<Code size={18} />}
          label="Inline Code"
          onClick={onCode}
        />
        <ToolbarButton
          icon={<SquareCode size={18} />}
          label="Code Block"
          onClick={onCodeBlock}
        />
        <ToolbarButton
          icon={<Link size={18} />}
          label="Link"
          shortcut="Ctrl+K"
          onClick={onLink}
        />
        <ToolbarButton
          icon={<FileImage size={18} />}
          label="Image"
          onClick={onImage}
        />
        <ToolbarButton
          icon={<Table2 size={18} />}
          label="Table"
          onClick={onTable}
        />
        <ToolbarButton
          icon={<Minus size={18} />}
          label="Horizontal Rule"
          onClick={onHr}
        />
      </div>
    </div>
  );
}
