'use client';

import { getTotalUSD, formatUSD, subscribeCostChanged } from '@/src/utils/usageCost';
import { useEffect, useState } from 'react';
import { Badge } from './ui/badge';
import { UsageAnalyticsDialog } from './UsageAnalyticsDialog';

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function UsageCostBadge(props?: { className?: string }) {
  const [total, setTotal] = useState(0);
  const [label, setLabel] = useState(formatUSD(0));
  const [isDialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const init = getTotalUSD();
    setTotal(init);
    setLabel(formatUSD(init));

    const unsubscribe = subscribeCostChanged((val) => {
      setTotal(val);
      setLabel(formatUSD(val));
    });

    return () => unsubscribe();
  }, []);

  return (
    <>
      <button onClick={() => setDialogOpen(true)} className="focus:outline-none">
        <Badge variant="secondary" className={cn('whitespace-nowrap cursor-pointer', props?.className)}>
          {label}
        </Badge>
      </button>
      <UsageAnalyticsDialog open={isDialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}