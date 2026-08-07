import { ChangeEvent, DragEvent, useRef, useState } from 'react';
import { FileUp } from 'lucide-react';
import { Button } from '@/src/components/ui/button';

interface CsvUploadZoneProps {
  onFileSelected: (file: File) => void;
  labels: {
    title: string;
    hint: string;
    selectFile: string;
  };
}

const CsvUploadZone = ({ onFileSelected, labels }: CsvUploadZoneProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (files: FileList | null) => {
    const file = files?.item(0);
    if (file) onFileSelected(file);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    handleFiles(event.dataTransfer.files);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleFiles(event.target.files);
    event.target.value = '';
  };

  return (
    <div
      role='button'
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') inputRef.current?.click();
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
        isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/60 hover:bg-muted/40'
      }`}
    >
      <input ref={inputRef} type='file' accept='.csv,text/csv' className='hidden' onChange={handleInputChange} />
      <FileUp className='mb-3 size-10 text-muted-foreground' />
      <h2 className='text-lg font-semibold'>{labels.title}</h2>
      <p className='mt-1 text-sm text-muted-foreground'>{labels.hint}</p>
      <Button
        type='button'
        variant='outline'
        className='mt-4'
        onClick={(event) => {
          event.stopPropagation();
          inputRef.current?.click();
        }}
      >
        {labels.selectFile}
      </Button>
    </div>
  );
};

export default CsvUploadZone;
