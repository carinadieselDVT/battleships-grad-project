// eslint.config.js

import { defineConfig } from 'eslint/config'

export default defineConfig([
  {
    files: ['**/*.{js,jsx}'],
    ignores: ['node_modules/', 'dist/', 'dist/**', 'public/', 'public/**'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        location: 'readonly',
        history: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        WebSocket: 'readonly',
        fetch: 'readonly',
        MutationObserver: 'readonly',
        HTMLElement: 'readonly',
        CustomEvent: 'readonly',
        customElements: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        console: 'readonly',
        alert: 'readonly',
        confirm: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-undef': 'error',
      'no-console': 'off', // using structured console logs during dev/mock
    },
  },
])
