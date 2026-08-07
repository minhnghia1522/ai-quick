import { BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { ColumnStatistics as ColumnStatisticsData } from '@/src/types/csv';

interface ColumnStatisticsProps {
  statistics: ColumnStatisticsData | null;
  labels: {
    title: string;
    columnName: string;
    detectedType: string;
    emptyValues: string;
    uniqueValues: string;
    maximumLength: string;
    minimumLength: string;
    noColumn: string;
  };
}

const ColumnStatistics = ({ statistics, labels }: ColumnStatisticsProps) => (
  <Card className='h-fit'>
    <CardHeader className='px-4 pb-2'>
      <CardTitle className='flex items-center gap-2 text-base'>
        <BarChart3 className='size-4' />
        {labels.title}
      </CardTitle>
    </CardHeader>
    <CardContent className='px-4 text-sm'>
      {statistics ? (
        <dl className='space-y-3'>
          <div>
            <dt className='text-muted-foreground'>{labels.columnName}</dt>
            <dd className='truncate font-medium' title={statistics.columnName}>
              {statistics.columnName}
            </dd>
          </div>
          <div>
            <dt className='text-muted-foreground'>{labels.detectedType}</dt>
            <dd className='font-medium'>{statistics.detectedType}</dd>
          </div>
          <div className='grid grid-cols-2 gap-3'>
            <div>
              <dt className='text-muted-foreground'>{labels.emptyValues}</dt>
              <dd className='font-medium'>{statistics.emptyValues.toLocaleString()}</dd>
            </div>
            <div>
              <dt className='text-muted-foreground'>{labels.uniqueValues}</dt>
              <dd className='font-medium'>{statistics.uniqueValues.toLocaleString()}</dd>
            </div>
          </div>
          <div className='grid grid-cols-2 gap-3'>
            <div>
              <dt className='text-muted-foreground'>{labels.maximumLength}</dt>
              <dd className='font-medium'>{statistics.maximumLength.toLocaleString()}</dd>
            </div>
            <div>
              <dt className='text-muted-foreground'>{labels.minimumLength}</dt>
              <dd className='font-medium'>{statistics.minimumLength.toLocaleString()}</dd>
            </div>
          </div>
        </dl>
      ) : (
        <p className='text-muted-foreground'>{labels.noColumn}</p>
      )}
    </CardContent>
  </Card>
);

export default ColumnStatistics;
