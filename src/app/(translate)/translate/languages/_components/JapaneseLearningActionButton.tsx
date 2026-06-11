import { Button } from '@/src/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/src/components/ui/tooltip';
import { GraduationCap } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface JapaneseLearningActionButtonProps {
  visible: boolean;
  x: number;
  y: number;
  onClick: () => void;
}

const JapaneseLearningActionButton = ({ visible, x, y, onClick }: JapaneseLearningActionButtonProps) => {
  const t = useTranslations();

  if (!visible) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type='button'
          size='sm'
          className='fixed z-50 h-9 shadow-lg'
          style={{ left: x, top: y }}
          aria-label={t('TranslatePage.japaneseLearningAction')}
          onMouseDown={(event) => event.preventDefault()}
          onClick={onClick}
        >
          <GraduationCap className='mr-2 h-4 w-4' />
          {t('TranslatePage.japaneseLearningAction')}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{t('TranslatePage.japaneseLearningActionTooltip')}</TooltipContent>
    </Tooltip>
  );
};

export default JapaneseLearningActionButton;
