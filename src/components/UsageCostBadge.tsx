'use client';

import { useEffect, useState } from 'react';
import { Badge } from './ui/badge';
import { useAppStore } from '@/src/store';

interface UsageCostBadgeProps {
  className?: string;
  onClick?: () => void;
}

export function UsageCostBadge({ className, onClick }: UsageCostBadgeProps) {
  const { totalCost, refreshTotalCost, isLoading } = useAppStore();
  const [mounted, setMounted] = useState(false);

  // Handle hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
    // Load initial total cost when component mounts
    refreshTotalCost();
  }, [refreshTotalCost]);

  // Format cost for display
  const formatCost = (cost: number): string => {
    if (cost === 0) return '$0.0000';
    if (cost < 0.0001) return '<$0.0001';
    return `$${cost.toFixed(4)}`;
  };

  // Don't render anything until mounted to avoid hydration issues
  if (!mounted) {
    return null;
  }

  return (
    <Badge
      variant='outline'
      className={`cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors ${className || ''}`}
      onClick={onClick}
      title='Click to view detailed usage analytics'
    >
      {isLoading ? '...' : formatCost(totalCost)}
    </Badge>
  );
}
