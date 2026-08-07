export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const formatDelimiter = (delimiter: string): string => {
  if (delimiter === '\t') return 'TAB';
  if (delimiter === ' ') return 'SPACE';
  return delimiter || ',';
};
