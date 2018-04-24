echo "Preparing release"

rm -Rf node_modules
npm install
npm run clean
npm run bootstrap
npm run build
npm run test

echo "Repository is ready for release.
Please run: npm run publish"

