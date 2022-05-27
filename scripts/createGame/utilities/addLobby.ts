import path from 'node:path';

import {
  identifier,
  importDeclaration,
  importDefaultSpecifier,
  memberExpression,
  objectProperty,
  stringLiteral,
} from '@babel/types';

import { IGenerateOptions } from '../createGame';
import modifyFile from './modifyFile';
import addImport from './addImport';
import shortenImport from './shortenImport';

const FILE_PATH = path.resolve('./app/client/components/App/App.tsx');

export default async function addLobby(options: IGenerateOptions): Promise<void> {
  await modifyFile(FILE_PATH, (path) => {
    if (path.isProgram()) {
      addImport(
        path.node,
        importDeclaration(
          [importDefaultSpecifier(identifier(`${options.pascalCased}Lobby`))],
          stringLiteral(shortenImport(options.lobbyFilename)),
        ),
      );
    } else if (path.isVariableDeclaration() && path.node.declarations.length > 0) {
      const { id, init } = path.node.declarations[0];

      if (id.type === 'Identifier' && id.name === 'LOBBIES' && init?.type === 'ObjectExpression') {
        init.properties.push(
          objectProperty(
            memberExpression(identifier('EGame'), identifier(options.constCased)),
            identifier(`${options.pascalCased}Lobby`),
            true,
          ),
        );
      }
    }
  });
}
