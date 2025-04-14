'use client';
import { CodeBlock } from '@/components/CodeBlock';
import { LanguageSelect } from '@/components/LanguageSelect';
import { TextBlock } from '@/components/TextBlock';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { createPromptTranslateCode } from '@/prompt/codeTranslatePrompt';
import { OpenAIStream } from '@/service/openAI';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clipboard, LoaderCircle } from 'lucide-react';

export default function Home() {
  const [inputLanguage, setInputLanguage] = useState<string>('Natural Language');
  const [outputLanguage, setOutputLanguage] = useState<string>('Python');
  const [inputCode, setInputCode] = useState<string>('');
  const [outputCode, setOutputCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [hasTranslated, setHasTranslated] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  const handleTranslate = async () => {
    const maxCodeLength = 12000;

    if (!localStorage.getItem('apiKey')) {
      toast.error('Please enter an API key.');
      return;
    }

    if (inputLanguage === outputLanguage) {
      toast.error('Please select different languages.');
      return;
    }

    if (!inputCode) {
      toast.error('Please enter some code.');
      return;
    }

    if (inputCode.length > maxCodeLength) {
      toast.error(
        `Please enter code less than ${maxCodeLength} characters. You are currently at ${inputCode.length} characters.`
      );
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setOutputCode('');
    }
    setLoading(true);
    setOutputCode('');
    setCopied(false);

    const prompt = createPromptTranslateCode(inputLanguage, outputLanguage, inputCode);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const stream = await OpenAIStream(
        {
          prompt
        },
        abortController.signal
      );
      let code = '';
      for await (const textPart of stream.textStream) {
        setOutputCode((prevData) => prevData + textPart);
        code += textPart;
      }
      setLoading(false);
      setHasTranslated(true);
      copyToClipboard(code);
    } catch (error) {
      if (error instanceof Error) {
        if (['AbortError', 'aborted'].some((term) => error.message.includes(term))) return;
        toast.error(error.message);
      } else {
        toast.error('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
      setHasTranslated(true);
    }
  };

  const copyToClipboard = (text: string) => {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyOutput = () => {
    if (outputCode) {
      copyToClipboard(outputCode);
      toast.success('Copied to clipboard!');
    }
  };

  useEffect(() => {
    if (hasTranslated) {
      handleTranslate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outputLanguage]);

  return (
    <div className='flex h-full flex-col items-center bg-background px-4 text-foreground sm:px-10'>
      <div className='flex flex-col items-center justify-center pt-4'>
        <h1 className='text-center text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent'>
          AI Code Translator
        </h1>
        <p className='mt-2 text-muted-foreground text-center max-w-md'>
          Easily translate between programming languages and natural language with AI assistance
        </p>
      </div>

      <div className='mt-6 flex items-center gap-4'>
        <Button
          className='flex items-center gap-2 min-w-[140px]'
          variant='default'
          size='lg'
          onClick={handleTranslate}
          disabled={loading}
        >
          {loading ? (
            <>
              <LoaderCircle className='h-4 w-4 animate-spin' />
              Translating...
            </>
          ) : (
            <>
              Translate
              <ArrowRight className='h-4 w-4' />
            </>
          )}
        </Button>

        {hasTranslated && outputCode && (
          <Button variant='outline' size='lg' onClick={handleCopyOutput} className='flex items-center gap-2'>
            <Clipboard className='h-4 w-4' />
            {copied ? 'Copied!' : 'Copy Output'}
          </Button>
        )}
      </div>

      <div className='mt-2 text-center text-xs text-muted-foreground'>
        {loading
          ? 'Translating your code...'
          : hasTranslated
          ? 'Translation complete!'
          : 'Enter some code and click "Translate"'}
      </div>

      <div className='mt-8 grid w-full max-w-[1200px] gap-6 lg:grid-cols-2'>
        <div className='flex h-full flex-col space-y-3 rounded-lg border p-4 shadow-sm'>
          <h2 className='text-center text-xl font-semibold'>Input</h2>
          <LanguageSelect
            language={inputLanguage}
            onChange={(value) => {
              setInputLanguage(value);
              setHasTranslated(false);
              setInputCode('');
              setOutputCode('');
            }}
          />
          <div className='flex-1 overflow-hidden rounded-md border'>
            {inputLanguage === 'Natural Language' ? (
              <TextBlock
                text={inputCode}
                editable={!loading}
                onChange={(value) => {
                  setInputCode(value);
                  setHasTranslated(false);
                }}
              />
            ) : (
              <CodeBlock
                code={inputCode}
                editable={!loading}
                onChange={(value) => {
                  setInputCode(value);
                  setHasTranslated(false);
                }}
              />
            )}
          </div>
        </div>

        <div className='flex h-full flex-col space-y-3 rounded-lg border p-4 shadow-sm'>
          <h2 className='text-center text-xl font-semibold'>Output</h2>
          <LanguageSelect
            language={outputLanguage}
            onChange={(value) => {
              setOutputLanguage(value);
              setOutputCode('');
            }}
          />
          <div className='relative flex-1 overflow-hidden rounded-md border'>
            {outputLanguage === 'Natural Language' ? <TextBlock text={outputCode} /> : <CodeBlock code={outputCode} />}
            {loading && (
              <div className='absolute inset-0 flex items-center justify-center bg-background/80'>
                <LoaderCircle className='h-8 w-8 animate-spin text-primary' />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
