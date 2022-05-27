import path from 'node:path';

import { identifier, stringLiteral, tsEnumMember } from '@babel/types';

import { IGenerateOptions } from '../createGame';
import modifyFile from './modifyFile';

const FILE_PATH = path.resolve('./app/common/types/game.ts');

export default async function addGameEnumField(options: IGenerateOptions): Promise<void> {
  await modifyFile(FILE_PATH, (path) => {
    if (path.isTSEnumDeclaration()) {
      path.node.members.push(tsEnumMember(identifier(options.constCased), stringLiteral(options.camelCased)));
    }
  });
}
