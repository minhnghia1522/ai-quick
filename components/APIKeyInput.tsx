import { Input } from './ui/input';

interface Props {
  apiKey: string;
  onChange: (apiKey: string) => void;
}

export const APIKeyInput: React.FC<Props> = ({ apiKey, onChange }) => {
  return (
    <Input
      className="w-[380px]"
      type="password"
      placeholder="OpenAI API Key"
      value={apiKey}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};
