'use client';
import { CodeBlock } from '@/src/components/CodeBlock';
import { LanguageSelect } from '@/src/components/LanguageSelect';
import { TextBlock } from '@/src/components/TextBlock';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { createPromptTranslateCode } from '@/src/prompt/codeTranslatePrompt';
import { modelCallWithStreaming } from '@/src/service/translateService';
import { Button } from '@/src/components/ui/button';
import { ArrowRight, Clipboard, LoaderCircle } from 'lucide-react';
import { areAnyApiKeysAvailable } from '@/src/utils/getProvider';
import PageView from '@/src/components/PageView';

export default function Home() {
  const t = useTranslations();
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

    if (!areAnyApiKeysAvailable()) {
      toast.error(t('CodeTranslatePage.apiKeyError'));
      return;
    }

    if (inputLanguage === outputLanguage) {
      toast.error(t('CodeTranslatePage.selectDifferentLanguagesError'));
      return;
    }

    if (!inputCode) {
      toast.error(t('CodeTranslatePage.enterCodeError'));
      return;
    }

    if (inputCode.length > maxCodeLength) {
      toast.error(t('CodeTranslatePage.maxLengthError', { maxLength: maxCodeLength, currentLength: inputCode.length }));
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
      const stream = await modelCallWithStreaming(
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
        toast.error(t('CodeTranslatePage.unexpectedError'));
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
      toast.success(t('CodeTranslatePage.copiedToClipboard'));
    }
  };

  useEffect(() => {
    if (hasTranslated) {
      handleTranslate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outputLanguage]);

  const renderBody = () => {
    return (
      <div className='flex flex-col w-full max-w-[1400px] mx-auto gap-5 px-4 md:px-6'>
        {/* Control Panel */}
        <div className='flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/30 rounded-lg p-4 border shadow-sm'>
          <div className='flex items-center gap-2'>
            <Button
              className='flex items-center gap-2 min-w-[120px]'
              variant='default'
              size='sm'
              onClick={handleTranslate}
              disabled={loading}
            >
              {loading ? (
                <>
                  <LoaderCircle className='h-4 w-4 animate-spin' />
                  {t('CodeTranslatePage.translatingButton')}
                </>
              ) : (
                <>
                  {t('CodeTranslatePage.translateButton')}
                  <ArrowRight className='h-4 w-4' />
                </>
              )}
            </Button>

            {hasTranslated && outputCode && (
              <Button
                variant='outline'
                size='sm'
                onClick={handleCopyOutput}
                className={`flex items-center gap-2 ${
                  copied
                    ? 'bg-green-50 text-green-700 border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                    : ''
                }`}
              >
                <Clipboard className='h-4 w-4' />
                {copied ? t('CodeTranslatePage.copiedButton') : t('CodeTranslatePage.copyOutputButton')}
              </Button>
            )}
          </div>
        </div>

        {/* Code Editors */}
        <div className='grid w-full gap-6 lg:grid-cols-2 mb-10'>
          {/* Input Panel */}
          <div className='flex h-full flex-col space-y-3 rounded-lg border p-5 shadow-sm bg-card'>
            <div className='flex justify-between items-center gap-5'>
              <h2 className='text-xl font-semibold whitespace-nowrap flex-shrink-0'>
                {t('CodeTranslatePage.inputLabel')}
              </h2>
              <div className='flex-1'>
                <LanguageSelect
                  language={inputLanguage}
                  onChange={(value) => {
                    setInputLanguage(value);
                    setHasTranslated(false);
                    setInputCode('');
                    setOutputCode('');
                  }}
                />
              </div>
            </div>
            <div className='flex-1 overflow-hidden rounded-md border bg-muted/40 min-h-[450px]'>
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

          {/* Output Panel */}
          <div className='flex h-full flex-col space-y-3 rounded-lg border p-5 shadow-sm bg-card'>
            <div className='flex justify-between items-center gap-5'>
              <h2 className='text-xl font-semibold whitespace-nowrap flex-shrink-0'>
                {t('CodeTranslatePage.outputLabel')}
              </h2>
              <div className='flex-1'>
                <LanguageSelect
                  language={outputLanguage}
                  onChange={(value) => {
                    setOutputLanguage(value);
                    setOutputCode('');
                  }}
                />
              </div>
            </div>
            <div className='relative flex-1 overflow-hidden rounded-md border bg-muted/40 min-h-[450px]'>
              {outputLanguage === 'Natural Language' ? (
                <TextBlock text={outputCode} />
              ) : (
                <CodeBlock code={outputCode} />
              )}
              {loading && (
                <div className='absolute inset-0 flex flex-col items-center justify-center bg-card/90 backdrop-blur-sm transition-all'>
                  <LoaderCircle className='h-10 w-10 animate-spin text-primary mb-3' />
                  <div className='text-sm text-muted-foreground'>{t('CodeTranslatePage.statusTranslating')}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <PageView
      title={{ titleName: t('CodeTranslatePage.title'), description: t('CodeTranslatePage.description') }}
      body={renderBody()}
    />
  );
}
