'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
}

export const MetricCard: React.FC<MetricCardProps> = ({ title, value, description, icon: Icon }) => {
  return (
    <Card className='h-fit gap-1 py-3'>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2 px-4 py-3'>
        <CardTitle className='text-xs lg:text-sm font-medium'>{title}</CardTitle>
        <Icon className='h-3.5 w-3.5 lg:h-4 lg:w-4 text-muted-foreground' />
      </CardHeader>
      <CardContent className='px-4 pb-3'>
        <div className='text-xl lg:text-2xl font-bold'>{value}</div>
        <p className='text-xs text-muted-foreground line-clamp-1'>{description}</p>
      </CardContent>
    </Card>
  );
};
