import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/src/lib/utils';

type MarkdownPreviewProps = {
  content: string;
  className?: string;
};

const MarkdownPreview = ({ content, className }: MarkdownPreviewProps) => (
  <div className={cn('w-full min-w-0 overflow-x-auto text-sm leading-relaxed text-foreground', className)}>
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => <h1 className='mb-3 mt-0 text-xl font-semibold leading-tight'>{children}</h1>,
        h2: ({ children }) => <h2 className='mb-2 mt-4 text-lg font-semibold leading-tight'>{children}</h2>,
        h3: ({ children }) => <h3 className='mb-2 mt-3 text-base font-semibold leading-tight'>{children}</h3>,
        p: ({ children }) => <p className='mb-3 whitespace-pre-wrap last:mb-0'>{children}</p>,
        ul: ({ children }) => <ul className='mb-3 list-disc space-y-1 pl-5 last:mb-0'>{children}</ul>,
        ol: ({ children }) => <ol className='mb-3 list-decimal space-y-1 pl-5 last:mb-0'>{children}</ol>,
        li: ({ children }) => <li className='pl-1'>{children}</li>,
        blockquote: ({ children }) => (
          <blockquote className='mb-3 border-l-4 border-border pl-3 text-muted-foreground last:mb-0'>
            {children}
          </blockquote>
        ),
        a: ({ children, href }) => (
          <a
            className='text-blue-600 underline underline-offset-2 hover:text-blue-700'
            href={href}
            target='_blank'
            rel='noreferrer'
          >
            {children}
          </a>
        ),
        table: ({ children }) => (
          <div className='mb-3 w-full max-w-full overflow-x-auto rounded-md border last:mb-0'>
            <table className='w-full min-w-[520px] table-fixed border-collapse text-left'>{children}</table>
          </div>
        ),
        thead: ({ children }) => <thead className='bg-muted/70'>{children}</thead>,
        th: ({ children }) => (
          <th className='break-words border-b px-3 py-2 text-xs font-semibold uppercase'>{children}</th>
        ),
        td: ({ children }) => <td className='break-words border-t px-3 py-2 align-top'>{children}</td>,
        pre: ({ children }) => (
          <pre className='mb-3 overflow-x-auto rounded-md bg-slate-950 p-3 text-slate-50 last:mb-0'>{children}</pre>
        ),
        code: ({ children, className }) => (
          <code
            className={cn(
              'rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]',
              className?.startsWith('language-') && 'bg-transparent p-0 text-inherit'
            )}
          >
            {children}
          </code>
        )
      }}
    >
      {content}
    </ReactMarkdown>
  </div>
);

export default MarkdownPreview;
