#!/bin/bash
## Script for generating core modules documentation

VERSION=1.1.0
DOC_FOLDER=docs
DOCS_LOCATION=${PWD}/$DOC_FOLDER/api
TYPEDOC=${PWD}/node_modules/.bin/typedoc # Need to use root typedoc to pick up typedoc plugin

rm -rf $DOCS_LOCATION

echo "Generate documentation for packages"
${PWD}/node_modules/.bin/lerna exec -- $TYPEDOC --mode file --out $DOCS_LOCATION/\$LERNA_PACKAGE_NAME --excludePrivate --excludeExternals src/

echo "Documentation was generated. Please continue website relase directly in documentation repository"
