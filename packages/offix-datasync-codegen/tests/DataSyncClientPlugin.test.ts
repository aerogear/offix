import { readFileSync } from 'fs';
import { GraphbackCoreMetadata } from '@graphback/core';
import { buildSchema } from 'graphql';
import { Plugin } from '../src'

const schemaText = readFileSync(`${__dirname}/mock.graphql`, 'utf8')

test('Test json schema', () => {
  const crudMethods = {
    "create": true,
    "update": true,
    "findOne": true,
    "find": true,
    "delete": true,
  }

  const metadata = new GraphbackCoreMetadata({ crudMethods }, buildSchema(schemaText))
  const plugin = new Plugin({ modelOutputDir: './tmp/output/' });
  expect(plugin.getDocuments(metadata)).toMatchSnapshot();
});

test('Test datasync config', () => {
  const crudMethods = {
    "create": true,
    "update": true,
    "findOne": true,
    "find": true,
    "delete": true,
  }

  const metadata = new GraphbackCoreMetadata({ crudMethods }, buildSchema(schemaText))
  const plugin = new Plugin({ modelOutputDir: './tmp/output/' });
  expect(plugin.getDataSyncConfig(metadata)).toMatchSnapshot();
});
