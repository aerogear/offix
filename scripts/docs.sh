#!/bin/bash
## Script for generating core modules documentation

VERSION=1.1.0
DOC_FOLDER=docs.aerogear.org
DOCS_LOCATION=${PWD}/docs/$DOC_FOLDER/api/cordova/latest
TYPEDOC=${PWD}/node_modules/.bin/typedoc # Need to use root typedoc to pick up typedoc plugin

echo "Setting up Docs.Aerogear.org"
if [ ! -d "$DOCS_LOCATION" ]; then
    git clone git@github.com:aerogear/docs.aerogear.org.git
    echo "Moving repo to docs folder"
    mv ${PWD}/$DOC_FOLDER ${PWD}/docs/
else 
    echo "Removing existing documentation"
    rm -rf $DOCS_LOCATION
fi

echo "Piping Config to lerna.json"
# Ensure the package names are correct
echo "{\"lerna\": \"2.9.0\",\"packages\": [\"packages/app\",\"packages/auth\",\"packages/core\",\"packages/push\",\"packages/security\"],\"commands\": {\"publish\": {\"exact\": true}},\"version\": \"1.0.0-alpha.1\"}" > ${PWD}/lerna.json 

echo "Generate documentation for packages"
${PWD}/node_modules/.bin/lerna exec -- $TYPEDOC --mode file --out $DOCS_LOCATION/\${LERNA_PACKAGE_NAME:10} --excludePrivate --excludeExternals src/

echo "Restoring lerna.json"
echo "{\"lerna\": \"2.9.0\",\"packages\": [\"packages/*\"],\"commands\": {\"publish\": {\"exact\": true}},\"version\": \"1.0.0-alpha.1\"}" > ${PWD}/lerna.json

echo "Documentation was generated. Go to docs -> docs.aerogear.org to view new documentation"

