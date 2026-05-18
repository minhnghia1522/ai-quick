import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import { unified } from 'unified';

type MarkdownNode = {
  type: string;
  value?: string;
  url?: string;
  alt?: string;
  lang?: string;
  children?: MarkdownNode[];
};

const processor = unified().use(remarkParse).use(remarkGfm);

const compactBlankLines = (text: string) =>
  text
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

const renderInline = (nodes: MarkdownNode[] = []): string =>
  nodes
    .map((node) => {
      switch (node.type) {
        case 'text':
        case 'inlineCode':
          return node.value ?? '';
        case 'break':
          return '\n';
        case 'emphasis':
        case 'strong':
        case 'delete':
          return renderInline(node.children);
        case 'link': {
          const label = renderInline(node.children);
          if (!node.url || label === node.url) return label;

          return `${label} (${node.url})`;
        }
        case 'image':
          return node.alt ?? '';
        default:
          return node.children ? renderInline(node.children) : node.value ?? '';
      }
    })
    .join('');

const renderTable = (node: MarkdownNode) =>
  (node.children ?? [])
    .map((row) => (row.children ?? []).map((cell) => renderInline(cell.children)).join('\t'))
    .join('\n');

const renderList = (node: MarkdownNode) =>
  (node.children ?? [])
    .map((item, index) => {
      const marker = node.type === 'list' && (node as { ordered?: boolean }).ordered ? `${index + 1}. ` : '- ';
      const text = renderBlocks(item.children).replace(/\n/g, '\n  ');

      return `${marker}${text}`;
    })
    .join('\n');

const renderBlocks = (nodes: MarkdownNode[] = []): string =>
  nodes
    .map((node) => {
      switch (node.type) {
        case 'root':
          return renderBlocks(node.children);
        case 'paragraph':
          return renderInline(node.children);
        case 'heading':
          return renderInline(node.children);
        case 'blockquote':
          return renderBlocks(node.children)
            .split('\n')
            .map((line) => `> ${line}`)
            .join('\n');
        case 'list':
          return renderList(node);
        case 'listItem':
          return renderBlocks(node.children);
        case 'table':
          return renderTable(node);
        case 'thematicBreak':
          return '---';
        case 'code':
          return node.value ?? '';
        case 'html':
          return '';
        default:
          return node.children ? renderBlocks(node.children) : renderInline([node]);
      }
    })
    .filter(Boolean)
    .join('\n\n');

export const markdownToPlainText = (markdown: string) => {
  if (!markdown.trim()) return '';

  try {
    const tree = processor.parse(markdown) as MarkdownNode;
    return compactBlankLines(renderBlocks([tree]));
  } catch {
    return markdown.trim();
  }
};
