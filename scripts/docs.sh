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

echo "Generate documentation for packages"
${PWD}/node_modules/.bin/lerna exec --ignore "@aerogear/cordova-*" -- $TYPEDOC --mode file --out $DOCS_LOCATION/\${LERNA_PACKAGE_NAME:10} --excludePrivate --excludeExternals src/

echo "Documentation was generated. Go to docs -> docs.aerogear.org to view new documentation"

