import { readFileSync } from 'fs';
import { GlobSync } from 'glob';
import { join } from 'path';

/**
 * Loads the schema text from the model directory
 *
 * @export
 * @param {string} modelDir
 * @returns {string}
 */
export function loadSchema(modelDir: string): string {
  const modelPath = join(modelDir, '*.graphql');

  const files = new GlobSync(modelPath);

  if (files.found.length === 0) {
    throw new Error('Missing GraphQL schema');
  }

  return files.found.map((f: string) => {
    return readFileSync(f, 'utf8');
  }).join('\n');
}
