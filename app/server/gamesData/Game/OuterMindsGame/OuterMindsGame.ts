import shuffle from 'lodash/shuffle';
import times from 'lodash/times';

import { ALL_CARDS, STARTING_BUILDING_CARDS } from 'common/constants/games/outerMinds/cards';
import { CITY_HEIGHT, CITY_WIDTH } from 'common/constants/games/outerMinds/city';

import { GameType } from 'common/types/game';
import { Game, GamePlayerData, GameResult, Player } from 'common/types/games/outerMinds';
import { CardId } from 'common/types/games/outerMinds/cards';
import { City } from 'common/types/games/outerMinds/city';

import { getCardDef } from 'common/utilities/games/outerMinds/cardDefs';
import { getFreshBuilding } from 'common/utilities/games/outerMinds/cards/buildings';
import Entity, { EntityGenerator } from 'server/gamesData/Game/utilities/Entity/Entity';
import GameInfo from 'server/gamesData/Game/utilities/Entity/components/GameInfo';
import PlayersData from 'server/gamesData/Game/utilities/Entity/components/PlayersData';

import HandDraftPhase from 'server/gamesData/Game/OuterMindsGame/entities/HandDraftPhase';
import PlayPhase from 'server/gamesData/Game/OuterMindsGame/entities/PlayPhase';

export default class OuterMindsGame extends Entity<GameResult> {
  gameInfo = this.obtainComponent(GameInfo<GameType.OUTER_MINDS, this>);

  playersData = this.addComponent(PlayersData<GamePlayerData, this>, {
    init: () => ({}),
  });

  city: City = [];
  standardDeck: CardId[] = [];
  standardDiscard: CardId[] = [];
  bonusDeck: CardId[] = [];
  bonusDiscard: CardId[] = [];

  handDraftPhase: HandDraftPhase | null = null;
  playPhase: PlayPhase | null = null;

  *lifecycle(): EntityGenerator<GameResult> {
    const startingBuildingCards = shuffle(STARTING_BUILDING_CARDS);
    const pickedStartingBuildingCards: CardId[] = [];

    this.city = times(CITY_HEIGHT, () =>
      times(CITY_WIDTH, () => {
        const cardId = startingBuildingCards.pop();

        if (!cardId) {
          throw new Error('No card id');
        }

        pickedStartingBuildingCards.push(cardId);

        return getFreshBuilding({
          cardId,
          city: this.city,
        });
      }),
    );

    const draftCards: CardId[] = [];
    let playCards: CardId[] = [];

    ALL_CARDS.forEach((cardId) => {
      if (pickedStartingBuildingCards.includes(cardId)) {
        return;
      }

      const cardDef = getCardDef(cardId);

      if (cardDef.isBonus) {
        playCards.push(cardId);
      } else {
        draftCards.push(cardId);
      }
    });

    this.handDraftPhase = this.spawnEntity(HandDraftPhase, {
      deck: draftCards,
    });

    const { pickedCards, restCards } = yield* this.waitForEntity(this.handDraftPhase);

    this.handDraftPhase = null;

    playCards = shuffle([...playCards, ...restCards]);

    playCards.forEach((cardId) => {
      this.getCardDeck(cardId).push(cardId);
    });

    this.playPhase = this.spawnEntity(PlayPhase, {
      hands: pickedCards,
    });

    yield* this.waitForEntity(this.playPhase);
  }

  discardCard(cardId: CardId): void {
    this.getCardDiscard(cardId).push(cardId);
  }

  discardCards(cardIds: CardId[]): void {
    cardIds.forEach((cardId) => {
      this.discardCard(cardId);
    });
  }

  getCardDeck(cardId: CardId): CardId[] {
    return getCardDef(cardId).isBonus ? this.bonusDeck : this.standardDeck;
  }

  getCardDiscard(cardId: CardId): CardId[] {
    return getCardDef(cardId).isBonus ? this.bonusDiscard : this.standardDiscard;
  }

  getGamePlayers(): Player[] {
    return this.gameInfo.getPlayersWithData((playerIndex) => ({
      ...this.playersData.get(playerIndex),
      handDraft: this.handDraftPhase?.playersData.get(playerIndex) ?? null,
      play: this.playPhase?.playersData.get(playerIndex) ?? null,
    }));
  }

  toJSON(): Game {
    return {
      players: this.getGamePlayers(),
      phase: this.handDraftPhase?.toJSON() ?? this.playPhase?.toJSON() ?? null,
      city: this.city,
    };
  }
}
