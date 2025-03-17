'use client';
import { CodeBlock } from '@/components/CodeBlock';
import { LanguageSelect } from '@/components/LanguageSelect';
import { TextBlock } from '@/components/TextBlock';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { createPromptTranslateCode } from '@/prompt/codeTranslatePrompt';
import { OpenAIText } from '@/service/openAI';

export default function Home() {
  const [inputLanguage, setInputLanguage] = useState<string>('Natural Language');
  const [outputLanguage, setOutputLanguage] = useState<string>('Python');
  const [inputCode, setInputCode] = useState<string>('');
  const [outputCode, setOutputCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [hasTranslated, setHasTranslated] = useState<boolean>(false);

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

    setLoading(true);
    setOutputCode('');

    const prompt = createPromptTranslateCode(inputLanguage, outputLanguage, inputCode);
    try {
      const resultText = await OpenAIText({
        prompt
      });

      setOutputCode(resultText);
      setLoading(false);
      setHasTranslated(true);
      copyToClipboard(resultText);
    } catch (error) {
      toast.error((error as Error).message);
    }finally {
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
  };

  useEffect(() => {
    if (hasTranslated) {
      handleTranslate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outputLanguage]);

  return (
    <>
      <div className="flex h-full min-h-screen flex-col items-center bg-[#fff] px-4 pb-20 text-black sm:px-10">
        <div className="mt-10 flex flex-col items-center justify-center sm:mt-20">
          <div className="text-4xl font-bold">AI Code Translator</div>
        </div>

        <div className="mt-2 flex items-center space-x-2">
          <button
            className="w-[140px] cursor-pointer rounded-md bg-violet-500 px-4 py-2 font-bold hover:bg-violet-600 active:bg-violet-700"
            onClick={() => handleTranslate()}
            disabled={loading}
          >
            {loading ? 'Translating...' : 'Translate'}
          </button>
        </div>

        <div className="mt-2 text-center text-xs">
          {loading
            ? 'Translating...'
            : hasTranslated
              ? 'Output copied to clipboard!'
              : 'Enter some code and click "Translate"'}
        </div>

        <div className="mt-6 flex w-full max-w-[1200px] flex-col justify-between sm:flex-row sm:space-x-4">
          <div className="mt-8 flex h-full flex-col justify-center space-y-2 sm:mt-0 sm:w-2/4">
            <div className="text-center text-xl font-bold">Input</div>
            <LanguageSelect
              language={inputLanguage}
              onChange={(value) => {
                setInputLanguage(value);
                setHasTranslated(false);
                setInputCode('');
                setOutputCode('');
              }}
            />
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
          <div className="mt-8 flex h-full flex-col justify-center space-y-2 sm:mt-0 sm:w-2/4">
            <div className="text-center text-xl font-bold">Output</div>
            <LanguageSelect
              language={outputLanguage}
              onChange={(value) => {
                setOutputLanguage(value);
                setOutputCode('');
              }}
            />
            {outputLanguage === 'Natural Language' ? <TextBlock text={outputCode} /> : <CodeBlock code={outputCode} />}
          </div>
        </div>
      </div>
    </>
  );
}
