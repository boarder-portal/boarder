import path from 'node:path';

import createFile from './createFile';
import { IGenerateOptions } from '../createGame';

const FILE_PATH = path.resolve('./scripts/createGame/templates/GameStyles.template');

export default async function addGameStyles(options: IGenerateOptions): Promise<void> {
  await createFile(FILE_PATH, options.gameStylesFilename, options);
}
