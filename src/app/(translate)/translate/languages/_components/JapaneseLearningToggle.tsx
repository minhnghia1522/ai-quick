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
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type='button'
          variant={enabled ? 'default' : 'ghost'}
          size='sm'
          aria-pressed={enabled}
          aria-label={t('TranslatePage.japaneseLearningToggle')}
          onClick={() => onEnabledChange(!enabled)}
        >
          <BookOpen />
          {/* {t('TranslatePage.japaneseLearningToggle')} */}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{t('TranslatePage.japaneseLearningTooltip')}</TooltipContent>
    </Tooltip>
  );
};

export default JapaneseLearningToggle;
