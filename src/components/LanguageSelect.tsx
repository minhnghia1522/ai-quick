import type { FC } from 'react';

interface Props {
  language: string;
  onChange: (language: string) => void;
}

export const LanguageSelect: FC<Props> = ({ language, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
    <select
      className='w-full rounded-md border border-black bg-[#fff] px-4 py-2 text-black'
      value={language}
      onChange={handleChange}
    >
      {languages.map((language) => (
        <option key={language.value} value={language.value}>
          {language.label}
        </option>
      ))}
    </select>
  );
};

const languages = [
  { value: 'Natural Language', label: 'Natural Language' },
  { value: 'Assembly Language', label: 'Assembly Language' },
  { value: 'Bash', label: 'Bash' },
  { value: 'C', label: 'C' },
  { value: 'C#', label: 'C#' },
  { value: 'C++', label: 'C++' },
  { value: 'Clojure', label: 'Clojure' },
  { value: 'COBOL', label: 'COBOL' },
  { value: 'CoffeeScript', label: 'CoffeeScript' },
  { value: 'CSS', label: 'CSS' },
  { value: 'Dart', label: 'Dart' },
  { value: 'Elixir', label: 'Elixir' },
  { value: 'Fortran', label: 'Fortran' },
  { value: 'Go', label: 'Go' },
  { value: 'Groovy', label: 'Groovy' },
  { value: 'Haskell', label: 'Haskell' },
  { value: 'HTML', label: 'HTML' },
  { value: 'Java', label: 'Java' },
  { value: 'JavaScript', label: 'JavaScript' },
  { value: 'JSX', label: 'JSX' },
  { value: 'Julia', label: 'Julia' },
  { value: 'Kotlin', label: 'Kotlin' },
  { value: 'Lisp', label: 'Lisp' },
  { value: 'Lua', label: 'Lua' },
  { value: 'Matlab', label: 'Matlab' },
  { value: 'NoSQL', label: 'NoSQL' },
  { value: 'Objective-C', label: 'Objective-C' },
  { value: 'Pascal', label: 'Pascal' },
  { value: 'Perl', label: 'Perl' },
  { value: 'PHP', label: 'PHP' },
  { value: 'Python', label: 'Python' },
  { value: 'Powershell', label: 'Powershell' },
  { value: 'PL/SQL', label: 'PL/SQL' },
  { value: 'R', label: 'R' },
  { value: 'Racket', label: 'Racket' },
  { value: 'Ruby', label: 'Ruby' },
  { value: 'Rust', label: 'Rust' },
  { value: 'SAS', label: 'SAS' },
  { value: 'Scala', label: 'Scala' },
  { value: 'SQL', label: 'SQL' },
  { value: 'Swift', label: 'Swift' },
  { value: 'SwiftUI', label: 'SwiftUI' },
  { value: 'TSX', label: 'TSX' },
  { value: 'TypeScript', label: 'TypeScript' },
  { value: 'Visual Basic .NET', label: 'Visual Basic .NET' },
  { value: 'Vue', label: 'Vue' }
];
