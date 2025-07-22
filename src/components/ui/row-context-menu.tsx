import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface ContextMenuItem {
  label: string;
  action: () => void;
  shortcut?: string;
  separator?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  submenu?: boolean;
}

interface RowContextMenuProps {
  items: ContextMenuItem[];
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
}

export const RowContextMenu: React.FC<RowContextMenuProps> = ({
  items,
  isOpen,
  position,
  onClose,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && menuRef.current) {
      const menu = menuRef.current;
      const rect = menu.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let adjustedX = position.x;
      let adjustedY = position.y;

      if (position.x + rect.width > viewportWidth) {
        adjustedX = viewportWidth - rect.width - 10;
      }

      if (position.y + rect.height > viewportHeight) {
        adjustedY = viewportHeight - rect.height - 10;
      }

      menu.style.left = `${adjustedX}px`;
      menu.style.top = `${adjustedY}px`;
    }
  }, [isOpen, position]);

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={menuRef}
      className="fixed z-50 bg-white border border-gray-200 rounded-md shadow-lg py-1 min-w-[200px] dark:bg-gray-800 dark:border-gray-600"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {item.separator && <div className="h-px bg-gray-200 dark:bg-gray-600 my-1" />}
          <button
            className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between ${
              item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            }`}
            onClick={() => {
              if (!item.disabled) {
                item.action();
                onClose();
              }
            }}
            disabled={item.disabled}
          >
            <div className="flex items-center gap-2">
              {item.icon && <span className="w-4 h-4">{item.icon}</span>}
              <span>{item.label}</span>
            </div>
            <div className="flex items-center gap-2">
              {item.shortcut && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {item.shortcut}
                </span>
              )}
              {item.submenu && (
                <span className="text-xs text-gray-500 dark:text-gray-400">▶</span>
              )}
            </div>
          </button>
        </React.Fragment>
      ))}
    </div>,
    document.body
  );
};

interface UseRowContextMenuProps {
  items: ContextMenuItem[];
}

export const useRowContextMenu = ({ items }: UseRowContextMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setPosition({ x: event.clientX, y: event.clientY });
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const contextMenu = (
    <RowContextMenu
      items={items}
      isOpen={isOpen}
      position={position}
      onClose={handleClose}
    />
  );

  return {
    handleContextMenu,
    contextMenu,
    isOpen,
    handleClose,
  };
};