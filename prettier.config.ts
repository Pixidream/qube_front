import { type Config } from 'prettier';

const config: Config = {
  experimentalTernaries: true,
  experimentalOperatorPosition: 'start',
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  quoteProps: 'as-needed',
  trailingComma: 'all',
  bracketSpacing: true,
  objectWrap: 'preserve',
  bracketSameLine: false,
  arrowParens: 'always',
  endOfLine: 'lf',
};

export default config;
