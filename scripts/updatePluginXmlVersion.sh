#!/bin/bash

# do nothing if there's no plugin.xml
if [ ! -f plugin.xml ]; then
  exit 0;
fi

# grab version from package.json and update plugin.xml in place
VERSION=$(node -p 'require("./package.json").version;')

# matches version="x.x.x"$
# beware that there are other version= keys in the xml, these should not finish lines
sed -i "s/version=\"[0-9.]*\"\$/version=\"$VERSION\"/" plugin.xml
