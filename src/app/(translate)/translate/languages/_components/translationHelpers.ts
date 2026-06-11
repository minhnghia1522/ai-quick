export const MAX_TEXT_LENGTH = 25000;
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
export const TEXT_AREA_HEIGHT_DEFAULT = 128;
export const IMAGE_PANEL_HEIGHT = 320;
export const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
export const JAPANESE_LEARNING_MAX_SELECTION_LENGTH = 2000;
export const JAPANESE_LEARNING_ENABLED_STORAGE_KEY = 'translate:japanese-learning-enabled';

export type SourceMode = 'text' | 'image';
export type TranslationViewMode = 'text' | 'markdown';

export const formatFileSize = (size: number) => {
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / 1024 / 1024).toFixed(2)} MB`;
};

export const getImageSourceKey = (file: File) => `image:${file.name}:${file.type}:${file.size}:${file.lastModified}`;
