import { Input } from './ui/input';

interface Props extends Omit<React.ComponentProps<'input'>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  type?: string;
}

const TextField = ({ value, type = 'text', onChange, ...rest }: Props) => {
  return <Input className='w-full' type={type} value={value} onChange={(e) => onChange(e.target.value)} {...rest} />;
};

export default TextField;
