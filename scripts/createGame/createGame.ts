import path from 'node:path';

import camelCase from 'lodash/camelCase';
import snakeCase from 'lodash/snakeCase';
import startCase from 'lodash/startCase';
import upperFirst from 'lodash/upperFirst';

import addConstants from './utilities/addConstants';
import addDefaultOptions from './utilities/addDefaultOptions';
import addGame from './utilities/addGame';
import addGameComponent from './utilities/addGameComponent';
import addGameEntity from './utilities/addGameEntity';
import addGameEntityClass from './utilities/addGameEntityClass';
import addGameEnumField from './utilities/addGameEnumField';
import addGameNameAndPlayerSettings from './utilities/addGameNameAndPlayerSettings';
import addGameStyles from './utilities/addGameStyles';
import addGameTypes from './utilities/addGameTypes';
import addLobby from './utilities/addLobby';
import addLobbyComponent from './utilities/addLobbyComponent';
import addLocalStorageOptionsAndSettingsKeys from './utilities/addLocalStorageOptionsAndSettingsKeys';

const [gameName] = process.argv.slice(2);

if (!gameName) {
  throw new Error('Provide game name');
}

const camelCased = camelCase(gameName);
const constCased = snakeCase(gameName).toUpperCase();
const startCased = startCase(gameName);
const pascalCased = upperFirst(camelCased);

export interface GenerateOptions {
  camelCased: string;
  constCased: string;
  pascalCased: string;
  startCased: string;

  typesFilename: string;
  constantsFilename: string;
  lobbyComponentFilename: string;
  gameComponentFilename: string;
  gameComponentStylesFilename: string;
  gameEntityFilename: string;
}

(async () => {
  const options: GenerateOptions = {
    camelCased,
    constCased,
    pascalCased,
    startCased,

    typesFilename: path.resolve(`./app/common/types/games/${camelCased}/index.ts`),
    constantsFilename: path.resolve(`./app/common/constants/games/${camelCased}/index.ts`),
    lobbyComponentFilename: path.resolve(
      `./app/client/components/games/${camelCased}/${pascalCased}Lobby/${pascalCased}Lobby.tsx`,
    ),
    gameComponentFilename: path.resolve(
      `./app/client/components/games/${camelCased}/${pascalCased}Game/${pascalCased}Game.tsx`,
    ),
    gameComponentStylesFilename: path.resolve(
      `./app/client/components/games/${camelCased}/${pascalCased}Game/${pascalCased}Game.module.scss`,
    ),
    gameEntityFilename: path.resolve(`./app/server/gamesData/Game/${pascalCased}Game/${pascalCased}Game.ts`),
  };

  await Promise.all([
    addGameEnumField(options),
    addLocalStorageOptionsAndSettingsKeys(options),
    addGameNameAndPlayerSettings(options),
    addDefaultOptions(options),
    addGame(options),
    addGameEntity(options),
    addConstants(options),
    addGameComponent(options),
    addGameEntityClass(options),
    addGameStyles(options),
    addGameTypes(options),
    addLobby(options),
    addLobbyComponent(options),
  ]);
})().catch((err) => {
  console.log(err);

  process.exit(1);
});
