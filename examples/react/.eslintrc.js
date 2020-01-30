module.exports = {
  root: true,
  env: {
    browser: true,
    es6: true,
  },
  extends: [
    'plugin:react/recommended',
    'airbnb',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: [
    'react',
  ],
  rules: {
    "import/prefer-default-export": "off",
    "react/prop-types": "off",
    "jsx-a11y/label-has-associated-control": "off",
    "object-curly-newline": "off",
    "arrow-body-style": "off",
    "import/no-extraneous-dependencies": "off",
    "jsx-a11y/anchor-has-content": "off",
    "react/jsx-filename-extension": "off",
  },
};
