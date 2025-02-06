import React from 'react';
import {
  ContextMenu,
  ContextMenuItem,
  ContextMenuContent,
  ContextMenuSeparator,
  ContextMenuShortcut,
} from '@/components/ui/context-menu';
import { cn } from '@/lib/utils';

const menu = [
  {
    key: '1',
    name: 'Save',
    value: 'save',
    shortcut: '',
    active: true,
  },
  {
    key: '2',
    name: 'Share',
    value: 'share',
    shortcut: '',
    active: true,
  },
  {
    key: '10',
    name: 'Copy',
    value: 'copy',
    shortcut: 'Ctrl/⌘ + C',
    active: false,
  },
  {
    key: '11',
    name: 'Paste',
    value: 'paste',
    shortcut: 'Ctrl/⌘ + V',
    active: false,
  },
  {
    key: '12',
    name: 'Cut',
    value: 'cut',
    shortcut: 'Ctrl/⌘ + X',
    active: false,
  },
  {
    key: '13',
    name: 'Undo',
    value: 'undo',
    shortcut: 'Ctrl/⌘ + Z',
    active: true,
  },
  {
    key: '14',
    name: 'Redo',
    value: 'redo',
    shortcut: 'Ctrl/⌘ + Y',
    active: true,
  },
  {
    key: '20',
    name: 'Select All',
    value: 'selectAll',
    shortcut: '',
    active: true,
  },
  {
    key: '22',
    name: 'Delete',
    value: 'delete',
    shortcut: 'Delete',
    active: false,
  },
];

const SurfaceContextMenu = ({
  handleContextMenuClick,
}: {
  handleContextMenuClick: (value: string) => void;
}) => {
  const classname =
    'text-white focus:text-white focus:bg-[#0d99ff] py-1 text-xs';
  return (
    <ContextMenuContent className="w-64 py-3 bg-black">
      <ContextMenuItem
        inset
        className={cn(classname)}
        onClick={() => handleContextMenuClick('save')}
      >
        <span>Save</span>
      </ContextMenuItem>
      <ContextMenuItem
        inset
        className={cn(classname)}
        onClick={() => handleContextMenuClick('share')}
      >
        <span>Share</span>
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem
        inset
        className={cn(classname)}
        onClick={() => handleContextMenuClick('copy')}
      >
        <span>Copy</span>
        <ContextMenuShortcut>Ctrl/⌘ + C</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuItem
        inset
        className={cn(classname)}
        onClick={() => handleContextMenuClick('paste')}
      >
        <span>Paste</span>
        <ContextMenuShortcut>Ctrl/⌘ + V</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuItem
        inset
        className={cn(classname)}
        onClick={() => handleContextMenuClick('cut')}
      >
        <span>Cut</span>
        <ContextMenuShortcut>Ctrl/⌘ + X</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem
        inset
        className={cn(classname)}
        onClick={() => handleContextMenuClick('undo')}
      >
        <span>Undo</span>
        <ContextMenuShortcut>Ctrl/⌘ + Z</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuItem
        inset
        className={cn(classname)}
        onClick={() => handleContextMenuClick('redo')}
      >
        <span>Redo</span>
        <ContextMenuShortcut>Ctrl/⌘ + Y</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem
        inset
        className={cn(classname)}
        onClick={() => handleContextMenuClick('selectAll')}
      >
        <span>Select All</span>
      </ContextMenuItem>
      <ContextMenuItem
        inset
        className={cn(classname)}
        onClick={() => handleContextMenuClick('delete')}
      >
        <span>Delete</span>
        <ContextMenuShortcut>Delete</ContextMenuShortcut>
      </ContextMenuItem>
    </ContextMenuContent>
  );
};

export default SurfaceContextMenu;

explain this in one line