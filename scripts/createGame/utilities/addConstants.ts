import path from 'node:path';

import createFile from './createFile';
import { IGenerateOptions } from '../createGame';

const FILE_PATH = path.resolve('./scripts/createGame/templates/Constants.template');

export default async function addConstants(options: IGenerateOptions): Promise<void> {
  await createFile(FILE_PATH, options.constantsFilename, options);
}
