import path from 'node:path';

import { GenerateOptions } from '../createGame';
import createFile from './createFile';

const FILE_PATH = path.resolve('./scripts/createGame/templates/GameContentStyles.template');

export default async function addGameContentStyles(options: GenerateOptions): Promise<void> {
  await createFile(FILE_PATH, options.gameContentStylesFilename, options);
}
