import path from 'node:path';

import { GenerateOptions } from '../createGame';
import createFile from './createFile';

const FILE_PATH = path.resolve('./scripts/createGame/templates/GameContent.template');

export default async function addGameContent(options: GenerateOptions): Promise<void> {
  await createFile(FILE_PATH, options.gameContentFilename, options);
}
