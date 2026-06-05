import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
    ],
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...reactRefresh.configs.vite.rules,
      // Disable false positives: useMemo pattern is valid for dynamic components
      'react-hooks/static-components': 'off',
      'react-refresh/only-export-components': 'warn',
      // Disable cascading effect warning - valid pattern for async initialization
      'react-hooks/set-state-in-effect': 'warn',
      // Allow `any` in API response types where structure varies
      '@typescript-eslint/no-explicit-any': 'warn',
      // Allow empty object types that extend partial
      '@typescript-eslint/no-empty-object-type': 'off',
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
])