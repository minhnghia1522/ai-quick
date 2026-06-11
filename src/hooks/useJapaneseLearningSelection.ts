'use client';

import { useCallback, useEffect, useState, type RefObject } from 'react';

interface SelectionPosition {
  x: number;
  y: number;
}

interface JapaneseLearningSelectionState {
  text: string;
  position: SelectionPosition | null;
  visible: boolean;
}

interface UseJapaneseLearningSelectionParams {
  enabled: boolean;
  isBlocked?: boolean;
  maxLength: number;
  textareaRefs: RefObject<HTMLTextAreaElement | null>[];
}

const SELECTION_ROOT_SELECTOR = '[data-japanese-learning-selection-root="true"]';
const ACTION_BUTTON_MARGIN = 8;
const ACTION_BUTTON_WIDTH = 150;
const ACTION_BUTTON_HEIGHT = 36;

const initialState: JapaneseLearningSelectionState = {
  text: '',
  position: null,
  visible: false
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const copyTextareaStyles = (source: HTMLTextAreaElement, target: HTMLDivElement) => {
  const style = window.getComputedStyle(source);
  const properties = [
    'boxSizing',
    'fontFamily',
    'fontSize',
    'fontWeight',
    'fontStyle',
    'letterSpacing',
    'lineHeight',
    'paddingTop',
    'paddingRight',
    'paddingBottom',
    'paddingLeft',
    'borderTopWidth',
    'borderRightWidth',
    'borderBottomWidth',
    'borderLeftWidth',
    'textAlign',
    'textTransform',
    'textIndent',
    'tabSize'
  ] as const;

  properties.forEach((property) => {
    target.style[property] = style[property];
  });
};

const getTextareaSelectionRect = (textarea: HTMLTextAreaElement) => {
  const selectionEnd = textarea.selectionEnd ?? 0;
  const textBeforeSelection = textarea.value.slice(0, selectionEnd);
  const marker = document.createElement('span');
  const mirror = document.createElement('div');
  const rect = textarea.getBoundingClientRect();

  copyTextareaStyles(textarea, mirror);

  mirror.style.position = 'fixed';
  mirror.style.visibility = 'hidden';
  mirror.style.pointerEvents = 'none';
  mirror.style.whiteSpace = 'pre-wrap';
  mirror.style.overflowWrap = 'break-word';
  mirror.style.wordBreak = 'break-word';
  mirror.style.top = `${rect.top - textarea.scrollTop}px`;
  mirror.style.left = `${rect.left - textarea.scrollLeft}px`;
  mirror.style.width = `${textarea.offsetWidth}px`;
  mirror.style.minHeight = `${textarea.offsetHeight}px`;
  mirror.textContent = textBeforeSelection || ' ';

  marker.textContent = textarea.value[selectionEnd] ?? ' ';
  mirror.appendChild(marker);
  document.body.appendChild(mirror);

  const markerRect = marker.getBoundingClientRect();
  document.body.removeChild(mirror);

  return markerRect;
};

const getRegularSelectionRect = (selection: Selection) => {
  if (selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0);
  const rangeRect = range.getBoundingClientRect();

  if (rangeRect.width > 0 || rangeRect.height > 0) {
    return rangeRect;
  }

  return range.getClientRects()[0] ?? null;
};

const getClampedPosition = (rect: DOMRect | ClientRect): SelectionPosition => {
  const preferredX = rect.left + rect.width / 2 - ACTION_BUTTON_WIDTH / 2;
  const preferredY = rect.bottom + ACTION_BUTTON_MARGIN;
  const maxX = Math.max(ACTION_BUTTON_MARGIN, window.innerWidth - ACTION_BUTTON_WIDTH - ACTION_BUTTON_MARGIN);
  const maxY = Math.max(ACTION_BUTTON_MARGIN, window.innerHeight - ACTION_BUTTON_HEIGHT - ACTION_BUTTON_MARGIN);

  return {
    x: clamp(preferredX, ACTION_BUTTON_MARGIN, maxX),
    y: clamp(preferredY, ACTION_BUTTON_MARGIN, maxY)
  };
};

export const useJapaneseLearningSelection = ({
  enabled,
  isBlocked = false,
  maxLength,
  textareaRefs
}: UseJapaneseLearningSelectionParams) => {
  const [selectionState, setSelectionState] = useState<JapaneseLearningSelectionState>(initialState);

  const clearSelection = useCallback(() => {
    setSelectionState(initialState);
  }, []);

  const updateSelection = useCallback(() => {
    if (!enabled || isBlocked) {
      clearSelection();
      return;
    }

    const activeElement = document.activeElement;
    const activeTextarea = textareaRefs.find((ref) => ref.current && ref.current === activeElement)?.current;

    if (activeTextarea) {
      const { selectionStart, selectionEnd, value } = activeTextarea;

      if (selectionStart === selectionEnd) {
        clearSelection();
        return;
      }

      const selectedText = value.slice(selectionStart, selectionEnd).trim();

      if (!selectedText) {
        clearSelection();
        return;
      }

      setSelectionState({
        text: selectedText,
        position: getClampedPosition(getTextareaSelectionRect(activeTextarea)),
        visible: true
      });
      return;
    }

    const selection = window.getSelection();
    const selectedText = selection?.toString().trim() ?? '';

    if (!selection || !selectedText) {
      clearSelection();
      return;
    }

    const anchorElement =
      selection.anchorNode instanceof Element ? selection.anchorNode : selection.anchorNode?.parentElement;
    const focusElement =
      selection.focusNode instanceof Element ? selection.focusNode : selection.focusNode?.parentElement;
    const isInsideSupportedRoot =
      Boolean(anchorElement?.closest(SELECTION_ROOT_SELECTOR)) ||
      Boolean(focusElement?.closest(SELECTION_ROOT_SELECTOR));

    if (!isInsideSupportedRoot) {
      clearSelection();
      return;
    }

    const selectionRect = getRegularSelectionRect(selection);

    if (!selectionRect) {
      clearSelection();
      return;
    }

    setSelectionState({
      text: selectedText.slice(0, Math.max(selectedText.length, maxLength + 1)),
      position: getClampedPosition(selectionRect),
      visible: true
    });
  }, [clearSelection, enabled, isBlocked, maxLength, textareaRefs]);

  useEffect(() => {
    if (!enabled) {
      clearSelection();
      return;
    }

    const delayedUpdateSelection = () => {
      window.setTimeout(updateSelection, 0);
    };

    document.addEventListener('selectionchange', delayedUpdateSelection);
    document.addEventListener('mouseup', delayedUpdateSelection);
    document.addEventListener('keyup', delayedUpdateSelection);
    window.addEventListener('scroll', clearSelection, true);
    window.addEventListener('resize', clearSelection);

    return () => {
      document.removeEventListener('selectionchange', delayedUpdateSelection);
      document.removeEventListener('mouseup', delayedUpdateSelection);
      document.removeEventListener('keyup', delayedUpdateSelection);
      window.removeEventListener('scroll', clearSelection, true);
      window.removeEventListener('resize', clearSelection);
    };
  }, [clearSelection, enabled, updateSelection]);

  return {
    ...selectionState,
    clearSelection
  };
};
