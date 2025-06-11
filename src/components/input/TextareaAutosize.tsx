'use client';

import React, { TextareaHTMLAttributes, forwardRef, useLayoutEffect, useRef, useCallback, CSSProperties } from 'react';
import { cn } from '@/src/lib/utils';
import { Textarea } from '../ui/textarea'; // Giả sử Textarea từ shadcn/ui được sử dụng

interface TextareaAutosizeProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'style' | 'rows'> {
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onHeightChange?: (height: number) => void;
  customStyle?: Omit<CSSProperties, 'height' | 'resize' | 'overflowY'>;
  forcedHeight?: number;
  rows?: number;
}

const TextareaAutosize = forwardRef<HTMLTextAreaElement, TextareaAutosizeProps>(
  ({ value, onChange, className, customStyle, onHeightChange, forcedHeight, rows, ...props }, ref) => {
    const localTextareaRef = useRef<HTMLTextAreaElement>(null);
    const textareaRef = (ref || localTextareaRef) as React.RefObject<HTMLTextAreaElement>;

    const adjustHeight = useCallback(() => {
      if (!textareaRef.current) return;

      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      textarea.style.overflowY = 'hidden';
      textarea.style.resize = 'none';

      const scrollHeight = textarea.scrollHeight;
      let targetHeight: number;
      if (forcedHeight) {
        if (typeof forcedHeight === 'number') {
          targetHeight = forcedHeight;
        } else {
          targetHeight = scrollHeight;
        }
      } else {
        targetHeight = scrollHeight;
      }
      const height = Math.max(targetHeight, scrollHeight);
      textarea.style.height = `${height}px`;
      onHeightChange?.(height);
    }, [textareaRef, onHeightChange, forcedHeight]);

    useLayoutEffect(() => {
      adjustHeight();
    }, [value, adjustHeight, forcedHeight]);

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange?.(event);
    };

    const combinedStyle: CSSProperties = {
      ...customStyle,
      overflowY: 'hidden',
      resize: 'none'
    };

    return (
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        className={cn(className)}
        style={combinedStyle}
        rows={rows ?? 1}
        {...props}
      />
    );
  }
);

TextareaAutosize.displayName = 'TextareaAutosize';

export default TextareaAutosize;
