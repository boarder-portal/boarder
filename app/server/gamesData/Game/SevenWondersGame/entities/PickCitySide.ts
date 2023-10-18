import shuffle from 'lodash/shuffle';

import { GameType } from 'common/types/game';
import { CityName, GameClientEventType, PickCitySidePlayerData } from 'common/types/games/sevenWonders';

import Entity, { EntityGenerator } from 'server/gamesData/Game/utilities/Entity/Entity';
import GameInfo from 'server/gamesData/Game/utilities/Entity/components/GameInfo';
import Server from 'server/gamesData/Game/utilities/Entity/components/Server';

import SevenWondersGame from 'server/gamesData/Game/SevenWondersGame/SevenWondersGame';

const ALL_CITIES = Object.values(CityName);

export interface PickedCitySideInfo {
  city: CityName;
  pickedSide: number;
}

export default class PickCitySide extends Entity<PickedCitySideInfo[]> {
  static sidePicked(playerData: PickCitySidePlayerData): playerData is PickedCitySideInfo {
    return playerData.pickedSide !== null;
  }

  game = this.getClosestEntity(SevenWondersGame);

  gameInfo = this.obtainComponent(GameInfo<GameType.SEVEN_WONDERS, this>);
  server = this.obtainComponent(Server<GameType.SEVEN_WONDERS, this>);

  playersData = this.gameInfo.createPlayersData<PickCitySidePlayerData>({
    init: () => ({
      city: CityName.RHODOS,
      pickedSide: null,
    }),
  });

  *lifecycle(): EntityGenerator<PickedCitySideInfo[]> {
    let cities = ALL_CITIES;

    if (!this.gameInfo.options.includeLeaders) {
      cities = cities.filter((city) => city !== CityName.ROMA);
    }

    const shuffledCities = shuffle(cities);

    this.playersData.forEach((playerData, playerIndex) => {
      playerData.city = shuffledCities[playerIndex];
    });

    while (!this.playersData.every(PickCitySide.sidePicked)) {
      const { data: pickedSide, playerIndex } = yield* this.server.waitForSocketEvent(
        GameClientEventType.PICK_CITY_SIDE,
      );

      this.playersData.get(playerIndex).pickedSide = pickedSide;

      this.server.sendGameInfo();
    }

    return this.playersData.toArray();
  }
}
