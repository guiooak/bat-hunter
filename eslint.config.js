import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

export default tseslint.config(
  { ignores: ['dist'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // One way to import across folders: src/... (relative only within a
      // folder, and for assets outside src)
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: '^@components',
              message: "Import from 'src/components' instead.",
            },
            {
              regex: '^\\.\\./(?!.*\\.(scss|svg)$)(?!(\\.\\./)*brand/)',
              message: "Import from 'src/...' instead of a parent folder.",
            },
          ],
        },
      ],
      // Includes the React Compiler rules (no setState in effects, no refs
      // during render...)
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
  {
    // Node scripts: data migrations and maintenance jobs
    files: ['scripts/**/*.{js,mjs}'],
    languageOptions: {
      globals: globals.node,
    },
  },
  eslintConfigPrettier
);
