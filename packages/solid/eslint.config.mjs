import solid from 'eslint-plugin-solid/configs/recommended';
import prettier from 'eslint-plugin-prettier/recommended';
import * as tsParser from '@typescript-eslint/parser';
import tseslint from 'typescript-eslint';
import eslint from '@eslint/js';

export default tseslint.config(eslint.configs.recommended, tseslint.configs.recommended, {
  ignores: [
    '**/.DS_Store',
    '**/node_modules',
    'build',
    '.svelte-kit',
    '**/dist',
    'package',
    '**/.env',
    '**/.env.*',
    '!**/.env.example',
    '**/pnpm-lock.yaml',
    '**/package-lock.json',
    '**/yarn.lock',
  ],
  files: ['**/*.{ts,tsx}'],
  ...prettier,
  ...solid,
  rules: {
    'solid/reactivity': 'error',
  },
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      project: 'tsconfig.json',
    },
  },
});
