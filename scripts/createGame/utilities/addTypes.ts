import path from 'node:path';

import createFile from './createFile';
import { IGenerateOptions } from '../createGame';

const FILE_PATH = path.resolve('./scripts/createGame/templates/Types.template');

export default async function addTypes(options: IGenerateOptions): Promise<void> {
  await createFile(FILE_PATH, options.typesFilename, options);
}
