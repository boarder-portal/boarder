import path from 'node:path';

import {
  identifier,
  importDeclaration,
  importDefaultSpecifier,
  memberExpression,
  objectProperty,
  stringLiteral,
} from '@babel/types';

import { GenerateOptions } from '../createGame';
import addImport from './addImport';
import modifyFile from './modifyFile';
import shortenImport from './shortenImport';

const FILE_PATH = path.resolve('./app/client/pages/Game/Game.tsx');

export default async function addGame(options: GenerateOptions): Promise<void> {
  await modifyFile(FILE_PATH, (path) => {
    if (path.isProgram()) {
      addImport(
        path.node,
        importDeclaration(
          [importDefaultSpecifier(identifier(`${options.pascalCased}Game`))],
          stringLiteral(shortenImport(options.gameComponentFilename)),
        ),
      );
    } else if (path.isVariableDeclaration() && path.node.declarations.length > 0) {
      const { id, init } = path.node.declarations[0];

      if (id.type === 'Identifier' && id.name === 'GAMES_MAP' && init?.type === 'ObjectExpression') {
        init.properties.push(
          objectProperty(
            memberExpression(identifier('GameType'), identifier(options.constCased)),
            identifier(`${options.pascalCased}Game`),
            true,
          ),
        );
      }
    }
  });
}
