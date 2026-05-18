import { ReactNode } from 'react';
import { Label } from './ui/label';

interface Props {
  title?: {
    titleName?: string;
    description?: string;
  };
  body?: ReactNode;
}

const PageView = ({ title, body }: Props) => {
  return (
    <div className='flex flex-col size-full min-w-0  bg-background text-black px-4 sm:px-10 gap-10'>
      <div className='p-1 flex flex-col items-center justify-center sm:mt-10'>
        <Label className='text-4xl'>{title?.titleName}</Label>
        <p className='mt-2 text-muted-foreground text-center '>{title?.description}</p>
      </div>
      <div className='min-w-0'>{body}</div>
    </div>
  );
};

export default PageView;
