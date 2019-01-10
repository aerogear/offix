#!/bin/bash

# explicit declaration that this script needs a $TAG variable passed in e.g TAG=1.2.3 ./script.sh
TAG=$TAG

RELEASE_SYNTAX='^[0-9]+\.[0-9]+\.[0-9]+$'
PRERELEASE_SYNTAX='^[0-9]+\.[0-9]+\.[0-9]+(-.+)+$'

if [ ! "$CI" = true ]; then
  echo "Warning: this script should not be run outside of the CI"
  echo "If you really need to run this script, you can use"
  echo "CI=true ./scripts/publishRelease.sh"
  exit 1
fi

if [[ "$(echo $TAG | grep -E $RELEASE_SYNTAX)" == "$TAG" ]]; then
  echo "publishing a new release: $TAG"
  lerna exec npm publish
elif [[ "$(echo $TAG | grep -E $PRERELEASE_SYNTAX)" == "$TAG" ]]; then
  echo "publishing a new pre release: $TAG"
  lerna exec npm publish --tag next
else
  echo "Error: the tag $TAG is not valid. exiting..."
  exit 1
fi
 