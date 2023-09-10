import path from 'node:path';

import { identifier, memberExpression, objectProperty, stringLiteral } from '@babel/types';

import { GenerateOptions } from '../createGame';
import modifyFile from './modifyFile';

const FILE_PATH = path.resolve('./app/client/utilities/LocalStorageAtom.ts');

export default async function addLocalStorageOptionsAndSettingsKeys(options: GenerateOptions): Promise<void> {
  await modifyFile(FILE_PATH, (path) => {
    if (path.isVariableDeclaration() && path.node.declarations.length > 0) {
      const { id, init } = path.node.declarations[0];

      if (id.type === 'Identifier' && id.name === 'GAME_OPTIONS_KEYS' && init) {
        const expression = init.type === 'TSAsExpression' ? init.expression : init;

        if (expression.type === 'ObjectExpression') {
          expression.properties.push(
            objectProperty(
              memberExpression(identifier('GameType'), identifier(options.constCased)),
              stringLiteral(`game/${options.camelCased}/defaultOptions/v1`),
              true,
            ),
          );
        }
      } else if (id.type === 'Identifier' && id.name === 'PLAYER_SETTINGS_KEYS' && init) {
        const expression = init.type === 'TSAsExpression' ? init.expression : init;

        if (expression.type === 'ObjectExpression') {
          expression.properties.push(
            objectProperty(
              memberExpression(identifier('GameType'), identifier(options.constCased)),
              stringLiteral(`game/${options.camelCased}/playerSettings/v1`),
              true,
            ),
          );
        }
      }
    }
  });
}
