#!/bin/bash
rm -rf node_modules/offix-datastore
cd ../../packages/datastore/datastore && yarn build
cd ../../../examples/datastore
cp -r ../../packages/datastore/datastore node_modules/offix-datastore
rm -rf node_modules/offix-datastore/node_modules