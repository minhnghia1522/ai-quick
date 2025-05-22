import React, { useState } from 'react';
import { Input } from './ui/input';
import { Eye, EyeOff } from 'lucide-react';

interface Props extends Omit<React.ComponentProps<'input'>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
}

const PasswordField = ({ value, onChange, ...rest }: Props) => {
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className='relative w-full'>
      <Input
        className='w-full pr-10 no-browser-password-toggle'
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        {...rest}
        style={{ WebkitTextSecurity: showPassword ? 'none' : 'disc' } as React.CSSProperties}
      />
      <button
        type='button'
        onClick={toggleShowPassword}
        className='absolute inset-y-0 right-0 flex items-center px-3 text-gray-500'
        aria-label={showPassword ? 'Hide password' : 'Show password'}
      >
        {showPassword ? <EyeOff className='h-5 w-5' /> : <Eye className='h-5 w-5' />}
      </button>
    </div>
  );
};

export default PasswordField;
