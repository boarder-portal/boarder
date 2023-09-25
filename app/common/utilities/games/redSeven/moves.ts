import { Card, CardColor, GameOptions, Move, MoveType } from 'common/types/games/redSeven';

import { checkRule } from 'common/utilities/games/redSeven/rules';

export interface GetPlayCombinationsOptions {
  playerPalettes: Card[][];
  playerIndex: number;
  playerHand: Card[];
  currentRule: CardColor;
  previousMoves: Move[];
  gameOptions: GameOptions;
}

export function getPossibleMoves(options: GetPlayCombinationsOptions): Move[][] {
  const {
    playerPalettes,
    playerIndex,
    playerHand,
    currentRule,
    previousMoves,
    gameOptions: { advancedRules, withActionRule, v1p2Rules },
  } = options;

  const playerPalette = playerPalettes[playerIndex];
  const lastMove = previousMoves.at(-1);

  const possibleMoves: Move[][] = [];

  const isActionRuleInPlay = (cardValue: number): boolean => {
    return withActionRule && lastMove?.type === MoveType.ADD_CARD_TO_PALETTE && lastMove.card.value === cardValue;
  };

  const addMoveWithNextMoves = <Keys extends keyof GetPlayCombinationsOptions>(
    move: Move,
    newOptions: Pick<GetPlayCombinationsOptions, Keys>,
  ) => {
    const nextPossibleMoves = getPossibleMoves({
      ...options,
      previousMoves: [...previousMoves, move],
      ...newOptions,
    });

    possibleMoves.push(...nextPossibleMoves.map((moves) => [move, ...moves]));
  };

  if (isActionRuleInPlay(1)) {
    playerPalettes.forEach((otherPlayerPalette, otherPlayerIndex) => {
      if (
        otherPlayerIndex === playerIndex ||
        otherPlayerPalette.length === 1 ||
        (v1p2Rules && otherPlayerPalette.length < playerPalette.length)
      ) {
        return;
      }

      otherPlayerPalette.forEach((_card, cardIndex) => {
        addMoveWithNextMoves(
          {
            type: MoveType.ADD_CARD_TO_DECK,
            isRevertable: true,
            playerIndex: otherPlayerIndex,
            cardIndex,
          },
          {
            playerPalettes: playerPalettes.with(otherPlayerIndex, otherPlayerPalette.toSpliced(cardIndex, 1)),
          },
        );
      });
    });
  } else if (isActionRuleInPlay(3)) {
    possibleMoves.push([]);
  } else if (isActionRuleInPlay(7)) {
    playerPalette.slice(0, -1).forEach((card, cardIndex) => {
      addMoveWithNextMoves(
        {
          type: MoveType.ADD_CARD_FROM_PALETTE_TO_CANVAS,
          isRevertable: !advancedRules || card.value < playerPalette.length,
          cardIndex,
        },
        {
          playerPalettes: playerPalettes.with(playerIndex, playerPalette.toSpliced(cardIndex, 1)),
          currentRule: card.color,
        },
      );
    });

    if (v1p2Rules) {
      playerPalette.slice(0, -1).forEach((_card, cardIndex) => {
        addMoveWithNextMoves(
          {
            type: MoveType.ADD_CARD_TO_DECK,
            isRevertable: true,
            playerIndex,
            cardIndex,
          },
          {
            playerPalettes: playerPalettes.with(playerIndex, playerPalette.toSpliced(cardIndex, 1)),
          },
        );
      });
    }
  } else {
    const hasToPlayToPalette = isActionRuleInPlay(5) && playerPalette.length > 0;

    if (!lastMove || hasToPlayToPalette) {
      playerHand.forEach((card, cardIndex) => {
        addMoveWithNextMoves(
          {
            type: MoveType.ADD_CARD_TO_PALETTE,
            isRevertable: !withActionRule || card.value !== 3,
            cardIndex,
            card,
          },
          {
            playerPalettes: playerPalettes.with(playerIndex, [...playerPalette, card]),
            playerHand: playerHand.toSpliced(cardIndex, 1),
          },
        );
      });
    }

    if (!hasToPlayToPalette) {
      if (
        lastMove?.type !== MoveType.ADD_CARD_FROM_HAND_TO_CANVAS &&
        lastMove?.type !== MoveType.ADD_CARD_FROM_PALETTE_TO_CANVAS
      ) {
        playerHand.forEach((card, cardIndex) => {
          addMoveWithNextMoves(
            {
              type: MoveType.ADD_CARD_FROM_HAND_TO_CANVAS,
              isRevertable: !advancedRules || card.value <= playerPalette.length,
              cardIndex,
            },
            {
              playerHand: playerHand.toSpliced(cardIndex, 1),
              currentRule: card.color,
            },
          );
        });
      }

      if (checkRule(playerPalettes, playerIndex, currentRule)) {
        possibleMoves.push([
          {
            type: MoveType.END_TURN,
            isRevertable: false,
          },
        ]);
      }
    }
  }

  return possibleMoves;
}
