import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'
import i18n from './eslint-rules/no-literal-string.js'

export default defineConfig([
  globalIgnores(['dist']),
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
    plugins: { i18n },
    rules: {
      'i18n/no-literal-string': ['warn', {
        allowlist: ['QueueCare', 'Dr', 'N/A', '123 Healthcare Blvd, Kampala'],
      }],
    },
  },
])
