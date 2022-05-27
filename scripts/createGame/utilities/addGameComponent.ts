import path from 'node:path';

import createFile from './createFile';
import { IGenerateOptions } from '../createGame';

const FILE_PATH = path.resolve('./scripts/createGame/templates/GameComponent.template');

export default async function addGameComponent(options: IGenerateOptions): Promise<void> {
  await createFile(FILE_PATH, options.gameComponentFilename, options);
}
