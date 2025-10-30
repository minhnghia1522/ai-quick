'use client';

import { useEffect, useState } from 'react';
import { Badge } from './ui/badge';
import { useAppStore } from '@/src/store';
import { DollarSignIcon } from 'lucide-react';

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
    if (cost === 0) return '$0.00';
    if (cost < 0.01) return '<$0.01';
    return `$${cost.toFixed(2)}`;
  };

  // Don't render anything until mounted to avoid hydration issues
  if (!mounted) {
    return null;
  }

  return (
    <Badge
      variant="outline"
      className={`cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors ${className || ''}`}
      onClick={onClick}
      title="Click to view detailed usage analytics"
    >
      <DollarSignIcon className="h-3 w-3" />
      {isLoading ? '...' : formatCost(totalCost)}
    </Badge>
  );
}