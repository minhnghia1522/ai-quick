import { Button } from '@/src/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/src/components/ui/tooltip';
import { BookOpen } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface JapaneseLearningToggleProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
}

const JapaneseLearningToggle = ({ enabled, onEnabledChange }: JapaneseLearningToggleProps) => {
  const t = useTranslations();

  return (
    <div className='flex w-full max-w-full justify-end md:px-0 lg:px-6 xl:px-16'>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type='button'
            variant={enabled ? 'default' : 'outline'}
            size='sm'
            aria-pressed={enabled}
            aria-label={t('TranslatePage.japaneseLearningToggle')}
            onClick={() => onEnabledChange(!enabled)}
          >
            <BookOpen className='mr-2 h-4 w-4' />
            {t('TranslatePage.japaneseLearningToggle')}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t('TranslatePage.japaneseLearningTooltip')}</TooltipContent>
      </Tooltip>
    </div>
  );
};

export default JapaneseLearningToggle;
