'use client';

import { useEffect, RefObject } from 'react';
import { usePlayback } from '@/app/playback-context';

type KeyboardNavigationOptions = {
  containerRef: RefObject<HTMLElement>;
  itemSelector: string;
  onNavigate?: (newIndex: number) => void;
  onSelect?: (currentIndex: number) => void;
  onExit?: (direction: 'left' | 'right') => void;
};

export function useKeyboardNavigation({
  containerRef,
  itemSelector,
  onNavigate,
  onSelect,
  onExit,
}: KeyboardNavigationOptions) {
  const { activePanel, setActivePanel } = usePlayback();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current) return;

      const items = Array.from(containerRef.current.querySelectorAll(itemSelector));
      const currentFocusedItem = document.activeElement as HTMLElement;
      const currentIndex = items.indexOf(currentFocusedItem);

      let newIndex: number;

      switch (e.key) {
        case 'j':
        case 'ArrowDown':
          e.preventDefault();
          newIndex = Math.min(currentIndex + 1, items.length - 1);
          (items[newIndex] as HTMLElement).focus();
          onNavigate?.(newIndex);
          break;
        case 'k':
        case 'ArrowUp':
          e.preventDefault();
          newIndex = Math.max(currentIndex - 1, 0);
          (items[newIndex] as HTMLElement).focus();
          onNavigate?.(newIndex);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          onSelect?.(currentIndex);
          break;
        case 'h':
          e.preventDefault();
          onExit?.('left');
          break;
        case 'l':
          e.preventDefault();
          onExit?.('right');
          break;
        default:
          return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [containerRef, itemSelector, onNavigate, onSelect, onExit, setActivePanel]);

  return activePanel;
}
