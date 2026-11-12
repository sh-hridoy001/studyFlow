import React, { useRef, useCallback } from 'react';

interface UseLongPressOptions {
  delay?: number;
  onLongPress: () => void;
  onClick?: () => void;
}

export function useLongPress({
  delay = 450,
  onLongPress,
  onClick,
}: UseLongPressOptions) {
  const timerRef = useRef<number | null>(null);
  const longPressedRef = useRef(false);
  const touchStartPosRef = useRef<{ x: number; y: number } | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const triggerLongPress = useCallback(() => {
    longPressedRef.current = true;
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        navigator.vibrate(20);
      }
    } catch {
      // Ignore vibration errors on unsupported browsers
    }
    onLongPress();
  }, [onLongPress]);

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      longPressedRef.current = false;
      const touch = e.touches[0];
      if (touch) {
        touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };
      }
      clearTimer();
      timerRef.current = window.setTimeout(triggerLongPress, delay);
    },
    [clearTimer, triggerLongPress, delay]
  );

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartPosRef.current) return;
      const touch = e.touches[0];
      if (!touch) return;
      const dx = Math.abs(touch.clientX - touchStartPosRef.current.x);
      const dy = Math.abs(touch.clientY - touchStartPosRef.current.y);
      // Cancel long press if user is scrolling
      if (dx > 10 || dy > 10) {
        clearTimer();
        touchStartPosRef.current = null;
      }
    },
    [clearTimer]
  );

  const onTouchEnd = useCallback(() => {
    clearTimer();
    touchStartPosRef.current = null;
  }, [clearTimer]);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      longPressedRef.current = false;
      clearTimer();
      timerRef.current = window.setTimeout(triggerLongPress, delay);
    },
    [clearTimer, triggerLongPress, delay]
  );

  const onMouseUp = useCallback(() => {
    clearTimer();
  }, [clearTimer]);

  const onMouseLeave = useCallback(() => {
    clearTimer();
  }, [clearTimer]);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      clearTimer();
      triggerLongPress();
    },
    [clearTimer, triggerLongPress]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (longPressedRef.current) {
        e.preventDefault();
        e.stopPropagation();
        longPressedRef.current = false;
        return;
      }
      if (onClick) {
        onClick();
      }
    },
    [onClick]
  );

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onTouchCancel: onTouchEnd,
    onMouseDown,
    onMouseUp,
    onMouseLeave,
    onContextMenu: handleContextMenu,
    onClick: handleClick,
  };
}
