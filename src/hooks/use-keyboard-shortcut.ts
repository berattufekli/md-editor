'use client';

import { useEffect } from 'react';

type Combo = string; // e.g. "mod+b", "mod+shift+f", "mod+\\"

interface Options {
  /**
   * When true, the listener ignores key events originating from
   * editable elements (input, textarea, [contenteditable]).
   */
  ignoreInEditable?: boolean;
  /**
   * If provided, the shortcut only fires when this element contains
   * the active element. Useful for "global app" vs "editor-only" scopes.
   */
  scope?: React.RefObject<HTMLElement | null>;
  preventDefault?: boolean;
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (target.isContentEditable) return true;
  return false;
}

function parseCombo(combo: string): {
  mod: boolean;
  shift: boolean;
  alt: boolean;
  key: string;
} {
  const parts = combo.toLowerCase().split('+').map((p) => p.trim());
  const mod = parts.includes('mod') || parts.includes('cmd') || parts.includes('ctrl');
  const shift = parts.includes('shift');
  const alt = parts.includes('alt') || parts.includes('option');
  const key = parts[parts.length - 1];
  return { mod, shift, alt, key };
}

function comboMatches(event: KeyboardEvent, combo: string): boolean {
  const { mod, shift, alt, key } = parseCombo(combo);
  const evMod = event.metaKey || event.ctrlKey;
  if (mod !== evMod) return false;
  if (shift !== event.shiftKey) return false;
  if (alt !== event.altKey) return false;
  const eventKey = event.key.toLowerCase();
  return eventKey === key;
}

/**
 * useKeyboardShortcut — runs a callback when a global key combo is pressed.
 *
 * Combo syntax: lower-case key names joined with `+`.
 *   - `mod` is a cross-platform alias for cmd (mac) / ctrl (other).
 *   - Examples: "mod+b", "mod+shift+f", "mod+\\", "mod+,", "escape".
 */
export function useKeyboardShortcut(
  combo: Combo,
  callback: (event: KeyboardEvent) => void,
  options: Options = {},
): void {
  const { ignoreInEditable = false, scope, preventDefault = true } = options;

  useEffect(() => {
    function handler(event: KeyboardEvent) {
      if (ignoreInEditable && isEditableTarget(event.target)) return;
      if (scope?.current && !scope.current.contains(event.target as Node)) {
        return;
      }
      if (comboMatches(event, combo)) {
        if (preventDefault) event.preventDefault();
        callback(event);
      }
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [combo, callback, ignoreInEditable, scope, preventDefault]);
}

/**
 * useKeyboardShortcuts — registers multiple shortcuts against a shared
 * callback map. Convenient when you have several bindings on one component.
 */
export function useKeyboardShortcuts(
  bindings: Record<Combo, (event: KeyboardEvent) => void>,
  options: Options = {},
): void {
  const { ignoreInEditable = false, scope, preventDefault = true } = options;

  useEffect(() => {
    function handler(event: KeyboardEvent) {
      if (ignoreInEditable && isEditableTarget(event.target)) return;
      if (scope?.current && !scope.current.contains(event.target as Node)) {
        return;
      }
      for (const combo of Object.keys(bindings)) {
        if (comboMatches(event, combo)) {
          if (preventDefault) event.preventDefault();
          bindings[combo](event);
          return;
        }
      }
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [bindings, ignoreInEditable, scope, preventDefault]);
}
