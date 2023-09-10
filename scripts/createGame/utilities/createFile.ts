import fs from 'fs-extra';
import forEach from 'lodash/forEach';

import { GenerateOptions } from '../createGame';
import shortenImport from './shortenImport';

export default async function createFile(source: string, target: string, options: GenerateOptions): Promise<void> {
  let content = await fs.readFile(source, 'utf8');

  forEach(options, (value, key) => {
    content = content.replaceAll(`{{${key}}}`, key.endsWith('Filename') ? shortenImport(value) : value);
  });

  await fs.outputFile(target, content);
}
