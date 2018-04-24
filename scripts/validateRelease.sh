#!/bin/bash

# explicit declaration that this script needs a $TAG variable passed in e.g TAG=1.2.3 ./script.sh
TAG=$TAG
TAG_SYNTAX='[[:digit:]].[[:digit:]].[[:digit:]]'

# get version found in lerna.json. This is the source of truth
PACKAGE_VERSION=$(cat lerna.json | grep version | head -1 | awk -F: '{ print $2 }' | sed 's/[\",]//g' | tr -d '[[:space:]]')

# get names of packages being managed by lerna
PACKAGES=$(lerna --loglevel=silent ls | awk -F ' ' '{print $1}')

# validate tag has format x.y.z
if [[ ! $TAG =~ $TAG_SYNTAX ]]; then
  echo "tag $TAG does not have correct syntax x.y.z. exiting..."
  exit 1
fi

# validate that TAG == version found in lerna.json
if [[ $TAG != $PACKAGE_VERSION ]]; then
  echo "tag $TAG is not the same as package version found in lerna.json $PACKAGE_VERSION"
  exit 1
fi

# validate that all packages have the same version found in lerna.json
for package in $PACKAGES; do
  version=$(lerna --loglevel=silent ls | grep $package | awk -F ' ' '{print $2}' | awk -F 'v' '{print $2}')
  if [[ $version =~ $PACKAGE_VERSION ]]; then
    echo "package $package has version $version"
  else
    echo "package $package has version $version but expected $PACKAGE_VERSION"
    exit 1
  fi
done

echo "TAG and PACKAGE_VERSION are valid"