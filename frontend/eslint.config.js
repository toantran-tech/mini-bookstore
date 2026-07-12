import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'debug*.js', '**/debug*.js']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // Data fetching is intentionally started from effects in this client app.
      'react-hooks/set-state-in-effect': 'off',
      // Providers and their hooks are intentionally colocated in context modules.
      'react-refresh/only-export-components': 'off',
      // Effect callbacks execute after render, so local async declarations are initialized.
      'react-hooks/immutability': 'off',
    },
  },
])
