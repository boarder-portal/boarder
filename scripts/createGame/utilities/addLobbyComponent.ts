import path from 'node:path';

import createFile from './createFile';
import { IGenerateOptions } from '../createGame';

const FILE_PATH = path.resolve('./scripts/createGame/templates/LobbyComponent.template');

export default async function addLobbyComponent(options: IGenerateOptions): Promise<void> {
  await createFile(FILE_PATH, options.lobbyFilename, options);
}
