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
      const plugin = new Plugin({ jsonOutputFile: './tmp/generated.json' });
      expect(plugin.getDocuments(metadata)).toMatchSnapshot();
});
