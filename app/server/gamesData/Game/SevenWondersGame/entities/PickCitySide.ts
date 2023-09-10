import shuffle from 'lodash/shuffle';

import { GameType } from 'common/types/game';
import { CityName, GameClientEventType, PickCitySidePlayerData } from 'common/types/sevenWonders';

import { EntityGenerator } from 'server/gamesData/Game/utilities/Entity';
import ServerEntity from 'server/gamesData/Game/utilities/ServerEntity';

import SevenWondersGame from 'server/gamesData/Game/SevenWondersGame/SevenWondersGame';

const ALL_CITIES = Object.values(CityName);

export interface PickedCitySideInfo {
  city: CityName;
  pickedSide: number;
}

export default class PickCitySide extends ServerEntity<GameType.SEVEN_WONDERS, PickedCitySideInfo[]> {
  static sidePicked(playerData: PickCitySidePlayerData): playerData is PickedCitySideInfo {
    return playerData.pickedSide !== null;
  }

  game: SevenWondersGame;

  playersData: PickCitySidePlayerData[] = this.getPlayersData(() => ({
    city: CityName.RHODOS,
    pickedSide: null,
  }));

  constructor(game: SevenWondersGame) {
    super(game);

    this.game = game;
  }

  *lifecycle(): EntityGenerator<PickedCitySideInfo[]> {
    let cities = ALL_CITIES;

    if (!this.options.includeLeaders) {
      cities = cities.filter((city) => city !== CityName.ROMA);
    }

    const shuffledCities = shuffle(cities);

    this.playersData.forEach((playerData, playerIndex) => {
      playerData.city = shuffledCities[playerIndex];
    });

    while (!this.playersData.every(PickCitySide.sidePicked)) {
      const { data: pickedSide, playerIndex } = yield* this.waitForSocketEvent(GameClientEventType.PICK_CITY_SIDE);

      this.playersData[playerIndex].pickedSide = pickedSide;

      this.game.sendGameInfo();
    }

    return this.playersData;
  }
}
