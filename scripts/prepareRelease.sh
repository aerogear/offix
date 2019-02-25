#!/bin/bash
echo "Preparing release"

set -e

rm -Rf node_modules
npm install
npm run clean
npm run bootstrap
npm run build
npm run test

# don't run in CI
if [ ! "$CI" = true ]; then
  lerna publish --skip-git --force-publish=* --skip-npm
  npm run updateXml
fi

echo "Repository is ready for release."

