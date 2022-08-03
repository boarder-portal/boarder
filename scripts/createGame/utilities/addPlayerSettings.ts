import path from 'node:path';

import { identifier, memberExpression, objectExpression, objectProperty } from '@babel/types';

import { IGenerateOptions } from '../createGame';
import modifyFile from './modifyFile';

const FILE_PATH = path.resolve('./app/common/constants/games/common/index.ts');

export default async function addPlayerSettings(options: IGenerateOptions): Promise<void> {
  await modifyFile(FILE_PATH, (path) => {
    if (path.isVariableDeclaration() && path.node.declarations.length > 0) {
      const { id, init } = path.node.declarations[0];

      if (id.type === 'Identifier' && id.name === 'PLAYER_SETTINGS' && init?.type === 'ObjectExpression') {
        init.properties.push(
          objectProperty(
            memberExpression(identifier('EGame'), identifier(options.constCased)),
            objectExpression([]),
            true,
          ),
        );
      }
    }
  });
}
