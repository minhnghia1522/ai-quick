import { FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { CsvSummary as CsvSummaryData } from '@/src/types/csv';
import { formatDelimiter, formatFileSize } from '@/src/utils/csv/csvFormatters';

interface CsvSummaryProps {
  summary: CsvSummaryData | null;
  labels: {
    title: string;
    fileName: string;
    totalRows: string;
    totalColumns: string;
    delimiter: string;
    encoding: string;
    headerDetected: string;
    fileSize: string;
    noFile: string;
  };
}

const CsvSummary = ({ summary, labels }: CsvSummaryProps) => (
  <Card className='h-fit'>
    <CardHeader className='px-4 pb-2'>
      <CardTitle className='flex items-center gap-2 text-base'>
        <FileText className='size-4' />
        {labels.title}
      </CardTitle>
    </CardHeader>
    <CardContent className='px-4 text-sm'>
      {summary ? (
        <dl className='space-y-3'>
          <div>
            <dt className='text-muted-foreground'>{labels.fileName}</dt>
            <dd className='truncate font-medium' title={summary.fileName}>
              {summary.fileName}
            </dd>
          </div>
          <div className='grid grid-cols-2 gap-3'>
            <div>
              <dt className='text-muted-foreground'>{labels.totalRows}</dt>
              <dd className='font-medium'>{summary.totalRows.toLocaleString()}</dd>
            </div>
            <div>
              <dt className='text-muted-foreground'>{labels.totalColumns}</dt>
              <dd className='font-medium'>{summary.totalColumns.toLocaleString()}</dd>
            </div>
          </div>
          <div>
            <dt className='text-muted-foreground'>{labels.delimiter}</dt>
            <dd className='font-medium'>{formatDelimiter(summary.delimiter)}</dd>
          </div>
          <div>
            <dt className='text-muted-foreground'>{labels.encoding}</dt>
            <dd className='font-medium'>{summary.encoding}</dd>
          </div>
          <div>
            <dt className='text-muted-foreground'>{labels.headerDetected}</dt>
            <dd className='font-medium'>{summary.headerDetected ? 'Yes' : 'No'}</dd>
          </div>
          <div>
            <dt className='text-muted-foreground'>{labels.fileSize}</dt>
            <dd className='font-medium'>{formatFileSize(summary.fileSize)}</dd>
          </div>
        </dl>
      ) : (
        <p className='text-muted-foreground'>{labels.noFile}</p>
      )}
    </CardContent>
  </Card>
);

export default CsvSummary;
