'use client';

import { useEffect, useState } from 'react';
import { Badge } from './ui/badge';
import { useAppStore } from '@/src/store';

interface UsageCostBadgeProps {
  className?: string;
  onClick?: () => void;
}

export function UsageCostBadge({ className, onClick }: UsageCostBadgeProps) {
  const dailyCost = useAppStore((state) => state.dailyCost);
  const monthlyCost = useAppStore((state) => state.monthlyCost);
  const isLoading = useAppStore((state) => state.isLoading);
  const refreshCosts = useAppStore((state) => state.refreshCosts);
  const [mounted, setMounted] = useState(false);

  // Handle hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
    // Load initial total cost when component mounts
    refreshCosts();
  }, [refreshCosts]);

  // Format cost for display
  const formatCost = (cost: number): string => {
    if (cost === 0) return '$0.00';
    if (cost < 0.001) return '<$0.001';
    return `$${cost.toFixed(3)}`;
  };

  // Don't render anything until mounted to avoid hydration issues
  if (!mounted) {
    return null;
  }

  return (
    <Badge
      variant='outline'
      className={`cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors h-[34px] ${
        className || ''
      }`}
      onClick={onClick}
      title='Daily Cost | Monthly Cost (Click to view detailed usage analytics)'
    >
      {isLoading ? '...' : `${formatCost(dailyCost)} | ${formatCost(monthlyCost)}`}
    </Badge>
  );
}
