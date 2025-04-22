/* eslint-disable @typescript-eslint/no-explicit-any */
import { getDocument } from 'pdfjs-dist';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

export async function extractChunksFromPDF(file: File) {
  const pdf = await getDocument({ data: await file.arrayBuffer() }).promise;

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200
  });

  const allChunks: {
    content: string;
    chunkIndex: number;
    page?: number;
    startLine?: number;
    endLine?: number;
  }[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const pageText = content.items.map((item: any) => item.str).join(' ');

    const docs = await splitter.createDocuments([pageText]);

    docs.forEach((doc, i) => {
      allChunks.push({
        content: doc.pageContent,
        chunkIndex: i,
        page: pageNum
      });
    });
  }

  return allChunks;
}
