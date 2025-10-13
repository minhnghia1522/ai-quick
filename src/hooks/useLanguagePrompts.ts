'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { LANGUAGES } from '@/src/types/model';
import { createPromptTranslateLanguage } from '@/src/prompt/languageTranslatePrompt';

export type LanguagePrompt = {
  id: string;
  name: string;
  content: string;
  isActive: boolean;
  isDefault: boolean;
};

export type LanguagePromptState = {
  prompts: LanguagePrompt[];
  activePromptId: string;
};

const STORAGE_KEY = 'translate/languages';
const DEFAULT_PROMPT_NAME = 'Default Prompt';
const DEFAULT_PROMPT_CONTENT = createPromptTranslateLanguage(LANGUAGES.ja, LANGUAGES.vn, '').system;

const generatePromptId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `prompt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

const createDefaultPrompt = (isActive = true): LanguagePrompt => ({
  id: 'default',
  name: DEFAULT_PROMPT_NAME,
  content: DEFAULT_PROMPT_CONTENT,
  isActive,
  isDefault: true
});

const createDefaultState = (): LanguagePromptState => ({
  prompts: [createDefaultPrompt(true)],
  activePromptId: 'default'
});

type UnknownPrompt = Partial<Record<keyof LanguagePrompt, unknown>>;
type UnknownState = Partial<Record<keyof LanguagePromptState, unknown>>;

const ensureStateIntegrity = (input?: UnknownState | LanguagePromptState): LanguagePromptState => {
  const rawPrompts = Array.isArray(input?.prompts) ? (input?.prompts as unknown[]) : [];
  const sanitizedPrompts: LanguagePrompt[] = [];
  const seenIds = new Set<string>();

  for (const raw of rawPrompts) {
    if (!raw || typeof raw !== 'object') continue;

    const candidate = raw as UnknownPrompt;
    const isDefault = Boolean(candidate.isDefault);
    const rawId =
      typeof candidate.id === 'string' && candidate.id.trim().length > 0
        ? candidate.id.trim()
        : isDefault
        ? 'default'
        : '';

    if (!rawId) continue;

    const id = isDefault ? 'default' : rawId;
    if (seenIds.has(id)) continue;

    const name =
      typeof candidate.name === 'string' && candidate.name.trim().length > 0
        ? candidate.name.trim()
        : isDefault
        ? DEFAULT_PROMPT_NAME
        : 'Untitled Prompt';

    const content = typeof candidate.content === 'string' ? candidate.content : '';
    if (!content) continue;

    const prompt: LanguagePrompt = {
      id,
      name,
      content,
      isActive: Boolean(candidate.isActive),
      isDefault
    };

    if (isDefault) {
      prompt.name = DEFAULT_PROMPT_NAME;
      prompt.content = DEFAULT_PROMPT_CONTENT;
    }

    sanitizedPrompts.push(prompt);
    seenIds.add(id);
  }

  let prompts = sanitizedPrompts;

  const defaultIndex = prompts.findIndex((prompt) => prompt.isDefault);
  if (defaultIndex === -1) {
    const defaultPrompt = createDefaultPrompt(prompts.length === 0);
    prompts = [defaultPrompt, ...prompts.map((prompt) => ({ ...prompt, isActive: false }))];
  } else {
    const defaultIsActive = prompts[defaultIndex].isActive;
    prompts[defaultIndex] = createDefaultPrompt(defaultIsActive);
  }

  if (prompts.length === 0) {
    return createDefaultState();
  }

  let activePromptId =
    typeof input?.activePromptId === 'string' && input.activePromptId.trim().length > 0
      ? input.activePromptId.trim()
      : '';

  if (!prompts.some((prompt) => prompt.id === activePromptId)) {
    activePromptId =
      prompts.find((prompt) => prompt.isActive)?.id ?? prompts.find((prompt) => prompt.isDefault)?.id ?? prompts[0].id;
  }

  const normalizedPrompts = prompts.map((prompt) => {
    if (prompt.isDefault) {
      return {
        ...createDefaultPrompt(prompt.id === activePromptId),
        isActive: prompt.id === activePromptId
      };
    }

    return {
      ...prompt,
      isActive: prompt.id === activePromptId
    };
  });

  const resolvedActiveId =
    normalizedPrompts.find((prompt) => prompt.id === activePromptId)?.id ?? normalizedPrompts[0].id;

  return {
    prompts: normalizedPrompts.map((prompt) =>
      prompt.id === resolvedActiveId ? { ...prompt, isActive: true } : { ...prompt, isActive: false }
    ),
    activePromptId: resolvedActiveId
  };
};

const readStateFromStorage = (): LanguagePromptState => {
  if (typeof window === 'undefined') {
    return createDefaultState();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return createDefaultState();
    }

    const parsed = JSON.parse(raw) as UnknownState;
    return ensureStateIntegrity(parsed);
  } catch (error) {
    console.error('Failed to read language prompts from storage', error);
    return createDefaultState();
  }
};

const persistStateToStorage = (state: LanguagePromptState) => {
  if (typeof window === 'undefined') return;

  try {
    const serialized = JSON.stringify(state);
    window.localStorage.setItem(STORAGE_KEY, serialized);

    try {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: STORAGE_KEY,
          newValue: serialized,
          storageArea: window.localStorage
        })
      );
    } catch {
      if (typeof document !== 'undefined' && typeof document.createEvent === 'function') {
        const fallbackEvent = document.createEvent('StorageEvent') as StorageEvent;
        fallbackEvent.initStorageEvent?.(
          'storage',
          false,
          false,
          STORAGE_KEY,
          null,
          serialized,
          window.location.href,
          window.localStorage
        );
        window.dispatchEvent(fallbackEvent);
      }
    }
  } catch (error) {
    console.error('Failed to persist language prompts state', error);
  }
};

export function useLanguagePrompts() {
  const [state, setState] = useState<LanguagePromptState>(() => createDefaultState());

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setState(readStateFromStorage());
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorage = (event: StorageEvent) => {
      if (event.storageArea !== window.localStorage) return;
      if (event.key !== null && event.key !== STORAGE_KEY) return;
      setState(readStateFromStorage());
    };

    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const commitState = useCallback((updater: (prev: LanguagePromptState) => LanguagePromptState) => {
    setState((prev) => {
      const next = ensureStateIntegrity(updater(prev));
      persistStateToStorage(next);
      return next;
    });
  }, []);

  const setActivePrompt = useCallback(
    (id: string) => {
      commitState((prev) => {
        const targetExists = prev.prompts.some((prompt) => prompt.id === id);
        const nextActiveId = targetExists ? id : 'default';
        const prompts = prev.prompts.map((prompt) => ({
          ...prompt,
          isActive: prompt.id === nextActiveId
        }));

        return {
          prompts,
          activePromptId: nextActiveId
        };
      });
    },
    [commitState]
  );

  const createPrompt = useCallback(
    (data: { name: string; content: string }) => {
      commitState((prev) => {
        const newId = generatePromptId();
        const normalizedName = data.name.trim();
        const customPromptCount = prev.prompts.filter((prompt) => !prompt.isDefault).length;

        const prompts = prev.prompts.map((prompt) => ({ ...prompt, isActive: false }));

        const newPrompt: LanguagePrompt = {
          id: newId,
          name: normalizedName.length > 0 ? normalizedName : `Prompt ${customPromptCount + 1}`,
          content: data.content,
          isActive: true,
          isDefault: false
        };

        return {
          prompts: [...prompts, newPrompt],
          activePromptId: newId
        };
      });
    },
    [commitState]
  );

  const updatePrompt = useCallback(
    (id: string, data: { name: string; content: string }) => {
      commitState((prev) => {
        let changed = false;

        const prompts = prev.prompts.map((prompt) => {
          if (prompt.id !== id || prompt.isDefault) {
            return prompt;
          }

          changed = true;
          const normalizedName = data.name.trim();

          return {
            ...prompt,
            name: normalizedName.length > 0 ? normalizedName : prompt.name,
            content: data.content
          };
        });

        if (!changed) {
          return prev;
        }

        return {
          prompts,
          activePromptId: prev.activePromptId
        };
      });
    },
    [commitState]
  );

  const deletePrompt = useCallback(
    (id: string) => {
      commitState((prev) => {
        const filteredPrompts = prev.prompts.filter((prompt) => prompt.id !== id || prompt.isDefault);

        if (filteredPrompts.length === prev.prompts.length) {
          return prev;
        }

        if (filteredPrompts.length === 0) {
          return createDefaultState();
        }

        const nextActiveId =
          id === prev.activePromptId
            ? filteredPrompts.find((prompt) => prompt.isDefault)?.id ?? filteredPrompts[0].id
            : prev.activePromptId;

        const prompts = filteredPrompts.map((prompt) => ({
          ...prompt,
          isActive: prompt.id === nextActiveId
        }));

        return {
          prompts,
          activePromptId: nextActiveId
        };
      });
    },
    [commitState]
  );

  const resetToDefault = useCallback(() => {
    commitState(() => createDefaultState());
  }, [commitState]);

  const isNameUnique = useCallback(
    (name: string, excludeId?: string) => {
      const normalized = name.trim().toLowerCase();
      if (normalized.length === 0) {
        return false;
      }

      return !state.prompts.some(
        (prompt) => prompt.id !== excludeId && prompt.name.trim().toLowerCase() === normalized
      );
    },
    [state.prompts]
  );

  const activePrompt = useMemo(
    () =>
      state.prompts.find((prompt) => prompt.id === state.activePromptId) ??
      state.prompts.find((prompt) => prompt.isActive) ??
      state.prompts[0],
    [state.prompts, state.activePromptId]
  );

  const defaultPrompt = useMemo(
    () => state.prompts.find((prompt) => prompt.isDefault) ?? createDefaultPrompt(state.activePromptId === 'default'),
    [state.prompts, state.activePromptId]
  );

  const customPrompts = useMemo(() => state.prompts.filter((prompt) => !prompt.isDefault), [state.prompts]);

  // TODO: Add unit tests for name uniqueness validation and active prompt transitions when the project's testing setup is available.

  return {
    prompts: state.prompts,
    activePrompt,
    defaultPrompt,
    customPrompts,
    setActivePrompt,
    createPrompt,
    updatePrompt,
    deletePrompt,
    resetToDefault,
    isNameUnique
  };
}
