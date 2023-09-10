import path from 'node:path';

import {
  identifier,
  importDeclaration,
  importSpecifier,
  memberExpression,
  objectProperty,
  stringLiteral,
} from '@babel/types';

import { GenerateOptions } from '../createGame';
import addImport from './addImport';
import modifyFile from './modifyFile';
import shortenImport from './shortenImport';

const FILE_PATH = path.resolve('./app/client/atoms/gameOptionsAtoms.ts');

export default async function addDefaultOptions(options: GenerateOptions): Promise<void> {
  await modifyFile(FILE_PATH, (path) => {
    if (path.isProgram()) {
      addImport(
        path.node,
        importDeclaration(
          [importSpecifier(identifier(`${options.constCased}_OPTIONS`), identifier('DEFAULT_GAME_OPTIONS'))],
          stringLiteral(shortenImport(options.constantsFilename)),
        ),
      );
    } else if (path.isVariableDeclaration() && path.node.declarations.length > 0) {
      const { id, init } = path.node.declarations[0];

      if (id.type === 'Identifier' && id.name === 'DEFAULT_OPTIONS' && init?.type === 'ObjectExpression') {
        init.properties.push(
          objectProperty(
            memberExpression(identifier('GameType'), identifier(options.constCased)),
            identifier(`${options.constCased}_OPTIONS`),
            true,
          ),
        );
      }
    }
  });
}
