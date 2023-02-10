import shuffle from 'lodash/shuffle';

import { EGame } from 'common/types/game';
import { ECity, EGameClientEvent, IPickCitySidePlayerData } from 'common/types/sevenWonders';

import { TGenerator } from 'server/gamesData/Game/utilities/Entity';
import ServerEntity from 'server/gamesData/Game/utilities/ServerEntity';

import SevenWondersGame from 'server/gamesData/Game/SevenWondersGame/SevenWondersGame';

const ALL_CITIES = Object.values(ECity);

export interface IPickedCitySideInfo {
  city: ECity;
  pickedSide: number;
}

export default class PickCitySide extends ServerEntity<EGame.SEVEN_WONDERS, IPickedCitySideInfo[]> {
  static sidePicked(playerData: IPickCitySidePlayerData): playerData is IPickedCitySideInfo {
    return playerData.pickedSide !== null;
  }

  game: SevenWondersGame;

  playersData: IPickCitySidePlayerData[] = this.getPlayersData(() => ({
    city: ECity.RHODOS,
    pickedSide: null,
  }));

  constructor(game: SevenWondersGame) {
    super(game);

    this.game = game;
  }

  *lifecycle(): TGenerator<IPickedCitySideInfo[]> {
    let cities = ALL_CITIES;

    if (!this.options.includeLeaders) {
      cities = cities.filter((city) => city !== ECity.ROMA);
    }

    const shuffledCities = shuffle(cities);

    this.playersData.forEach((playerData, playerIndex) => {
      playerData.city = shuffledCities[playerIndex];
    });

    while (!this.playersData.every(PickCitySide.sidePicked)) {
      const { data: pickedSide, playerIndex } = yield* this.waitForSocketEvent(EGameClientEvent.PICK_CITY_SIDE);

      this.playersData[playerIndex].pickedSide = pickedSide;

      this.game.sendGameInfo();
    }

    return this.playersData;
  }
}
