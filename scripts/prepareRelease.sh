echo "Preparing release"

rm -Rf node_modules
npm install
npm run clean
npm run bootstrap
npm run build
npm run test

# don't run in CI
if [ ! "$CI" = true ]; then
  lerna publish --skip-git --skip-npm
fi

echo "Repository is ready for release."

