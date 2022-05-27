import path from 'node:path';
import camelCase from 'lodash/camelCase';
import snakeCase from 'lodash/snakeCase';
import startCase from 'lodash/startCase';
import upperFirst from 'lodash/upperFirst';

import addGameEnumField from './utilities/addGameEnumField';
import addLocalStorageOptionsKey from './utilities/addLocalStorageOptionsKey';
import addGameName from './utilities/addGameName';
import addDefaultOptions from './utilities/addDefaultOptions';
import addLobby from './utilities/addLobby';
import addGame from './utilities/addGame';
import addGameEntity from './utilities/addGameEntity';
import addConstants from './utilities/addConstants';
import addGameComponent from './utilities/addGameComponent';
import addGameStyles from './utilities/addGameStyles';
import addGameEntityClass from './utilities/addGameEntityClass';
import addLobbyComponent from './utilities/addLobbyComponent';
import addTypes from './utilities/addTypes';

const [gameName] = process.argv.slice(2);

if (!gameName) {
  throw new Error('Provide game name');
}

const camelCased = camelCase(gameName);
const constCased = snakeCase(gameName).toUpperCase();
const startCased = startCase(gameName);
const pascalCased = upperFirst(camelCased);

export interface IGenerateOptions {
  camelCased: string;
  constCased: string;
  pascalCased: string;
  startCased: string;

  typesFilename: string;
  constantsFilename: string;
  lobbyFilename: string;
  gameComponentFilename: string;
  gameStylesFilename: string;
  gameEntityFilename: string;
}

(async () => {
  const options: IGenerateOptions = {
    camelCased,
    constCased,
    pascalCased,
    startCased,

    typesFilename: path.resolve(`./app/common/types/${camelCased}/index.ts`),
    constantsFilename: path.resolve(`./app/common/constants/games/${camelCased}/index.ts`),
    lobbyFilename: path.resolve(`./app/client/pages/games/${camelCased}/${pascalCased}Lobby/${pascalCased}Lobby.tsx`),
    gameComponentFilename: path.resolve(`./app/client/pages/Game/components/${pascalCased}Game/${pascalCased}Game.tsx`),
    gameStylesFilename: path.resolve(`./app/client/pages/Game/components/${pascalCased}Game/${pascalCased}Game.pcss`),
    gameEntityFilename: path.resolve(`./app/server/gamesData/Game/${pascalCased}Game/${pascalCased}Game.ts`),
  };

  await Promise.all([
    addGameEnumField(options),
    addLocalStorageOptionsKey(options),
    addGameName(options),
    addDefaultOptions(options),
    addLobby(options),
    addGame(options),
    addGameEntity(options),
    addConstants(options),
    addGameComponent(options),
    addGameEntityClass(options),
    addGameStyles(options),
    addLobbyComponent(options),
    addTypes(options),
  ]);
})().catch((err) => {
  console.log(err);

  process.exit(1);
});
