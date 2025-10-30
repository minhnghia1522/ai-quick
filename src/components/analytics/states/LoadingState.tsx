'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '../../ui/card';
import { Skeleton } from '../../ui/skeleton';

export const LoadingState: React.FC = () => {
  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className='h-4 w-20' />
            </CardHeader>
            <CardContent>
              <Skeleton className='h-8 w-16' />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className='space-y-4'>
        <Skeleton className='h-6 w-32' />
        <Skeleton className='h-64 w-full' />
      </div>
    </div>
  );
};
