/* eslint-disable @typescript-eslint/no-explicit-any */
import { getDocument } from 'pdfjs-dist';

export const extractTextFromPdf = async (file: File) => {
  const loadingTask = getDocument({ data: await file.arrayBuffer() });

  const pdf = await loadingTask.promise;
  const pagesText: string[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const strings = content.items.map((item: any) => item.str);
    pagesText.push(strings.join(' '));
  }

  return pagesText;
};

export const getMetaData = (file: File) => {
  return {
    filename: file.name,
    size: file.size,
    extension: file.name.split('.').pop() || '',
    mimetype: file.type
  };
};
