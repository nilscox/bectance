// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  ...tseslint.config(eslint.configs.recommended, tseslint.configs.strict, tseslint.configs.stylistic),
  {
    rules: {
      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', ignoreRestSiblings: true }],
    },
  },
];
