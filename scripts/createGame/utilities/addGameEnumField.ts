import path from 'node:path';

import { identifier, stringLiteral, tsEnumMember } from '@babel/types';

import { GenerateOptions } from '../createGame';
import modifyFile from './modifyFile';

const FILE_PATH = path.resolve('./app/common/types/game/index.ts');

export default async function addGameEnumField(options: GenerateOptions): Promise<void> {
  await modifyFile(FILE_PATH, (path) => {
    if (path.isTSEnumDeclaration() && path.node.id.name === 'GameType') {
      path.node.members.push(tsEnumMember(identifier(options.constCased), stringLiteral(options.camelCased)));
    }
  });
}
