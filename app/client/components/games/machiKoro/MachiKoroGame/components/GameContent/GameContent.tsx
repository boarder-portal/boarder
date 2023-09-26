import { FC, memo, useCallback, useEffect, useMemo, useState } from 'react';

import { GameType } from 'common/types/game';
import {
  CardId,
  CardType,
  GameClientEventType,
  GameServerEventType,
  LandmarkId,
  PlayerWaitingActionType,
} from 'common/types/games/machiKoro';

import getCard from 'common/utilities/games/machiKoro/getCard';

import usePlayer from 'client/hooks/usePlayer';
import useSocket from 'client/hooks/useSocket';

import Flex from 'client/components/common/Flex/Flex';
import { GameProps } from 'client/components/game/Game/Game';
import Board from 'client/components/games/machiKoro/MachiKoroGame/components/GameContent/components/Board/Board';
import Player from 'client/components/games/machiKoro/MachiKoroGame/components/GameContent/components/Player/Player';
import StatusAndActions from 'client/components/games/machiKoro/MachiKoroGame/components/GameContent/components/StatusAndActions/StatusAndActions';

import { NEW_TURN, playSound } from 'client/sounds';

import styles from './GameContent.module.scss';

const FORBIDDEN_TO_SWAP_CARD_TYPES: CardType[] = [CardType.MAJOR];

interface CardsToSwap {
  from: {
    cardId: CardId;
    playerIndex: number;
  } | null;
  toCardId: CardId | null;
}

const GameContent: FC<GameProps<GameType.MACHI_KORO>> = (props) => {
  const { io, gameInfo, gameResult } = props;

  const [board, setBoard] = useState(gameInfo.board);
  const [players, setPlayers] = useState(gameInfo.players);
  const [activePlayerIndex, setActivePlayerIndex] = useState(gameInfo.activePlayerIndex);
  const [waitingAction, setWaitingAction] = useState(gameInfo.turn?.waitingAction ?? null);
  const [dices, setDices] = useState(gameInfo.turn?.dices ?? []);
  const [withHarborEffect, setWithHarborEffect] = useState(gameInfo.turn?.withHarborEffect ?? false);
  const [cardsToSwap, setCardsToSwap] = useState<CardsToSwap>({ from: null, toCardId: null });

  const player = usePlayer(players);
  const isActive = player?.index === activePlayerIndex;

  const otherPlayers = useMemo(() => {
    const playerIndex = players.findIndex(({ login }) => login === player?.login);

    return [...players.slice(playerIndex + 1), ...players.slice(0, playerIndex)];
  }, [player, players]);

  const isWaitingForAction = Boolean(waitingAction);

  const buildCard = useCallback(
    (cardId: CardId) => {
      io.emit(GameClientEventType.BUILD_CARD, cardId);
    },
    [io],
  );

  const buildLandmark = useCallback(
    (cardId: LandmarkId) => {
      io.emit(GameClientEventType.BUILD_LANDMARK, cardId);
    },
    [io],
  );

  const endTurn = useCallback(() => {
    io.emit(GameClientEventType.END_TURN);
  }, [io]);

  const choosePlayer = useCallback(
    (playerIndex: number) => {
      if (waitingAction === PlayerWaitingActionType.CHOOSE_PLAYER) {
        io.emit(GameClientEventType.CHOOSE_PLAYER, playerIndex);
      }
    },
    [io, waitingAction],
  );

  const chooseDicesCount = useCallback(
    (count: number) => {
      io.emit(GameClientEventType.DICES_COUNT, count);
    },
    [io],
  );

  const chooseNeedToReroll = useCallback(
    (needToReroll: boolean) => {
      io.emit(GameClientEventType.NEED_TO_REROLL, needToReroll);
    },
    [io],
  );

  const chooseNeedToUseHarbor = useCallback(
    (needToUse: boolean) => {
      io.emit(GameClientEventType.NEED_TO_USE_HARBOR, needToUse);
    },
    [io],
  );

  const choosePublisherTarget = useCallback(
    (publisherTarget: CardType.SHOP | CardType.RESTAURANT) => {
      io.emit(GameClientEventType.PUBLISHER_TARGET, publisherTarget);
    },
    [io],
  );

  const getCardClickHandler = useCallback(
    (playerIndex: number) => {
      if (waitingAction === PlayerWaitingActionType.CHOOSE_CARDS_TO_SWAP) {
        if (!cardsToSwap.from) {
          if (playerIndex !== activePlayerIndex) {
            return (playerIndex: number, cardId: CardId) => {
              setCardsToSwap({
                from: {
                  playerIndex,
                  cardId,
                },
                toCardId: null,
              });
            };
          }
        } else if (!cardsToSwap.toCardId && playerIndex === activePlayerIndex) {
          return (playerIndex: number, cardId: CardId) => {
            if (!cardsToSwap.from) {
              return;
            }

            io.emit(GameClientEventType.CARDS_TO_SWAP, {
              from: cardsToSwap.from,
              toCardId: cardId,
            });

            setCardsToSwap({
              from: null,
              toCardId: null,
            });
          };
        }
      }
    },
    [activePlayerIndex, cardsToSwap.from, cardsToSwap.toCardId, io, waitingAction],
  );

  useEffect(() => {
    if (isActive && document.hidden) {
      playSound(NEW_TURN);
    }
  }, [isActive]);

  useSocket(io, {
    [GameServerEventType.UPDATE_PLAYERS]: (data) => {
      console.log(GameServerEventType.UPDATE_PLAYERS, data);
      setPlayers(data);
    },

    [GameServerEventType.DICES_ROLL]: (data) => {
      console.log(GameServerEventType.DICES_ROLL, data);

      setDices(data);
      setWithHarborEffect(false);
    },
    [GameServerEventType.CARDS_EFFECTS_RESULTS]: (data) => {
      console.log(GameServerEventType.CARDS_EFFECTS_RESULTS, data);
      setPlayers(data.players);
    },
    [GameServerEventType.BUILD_CARD]: (data) => {
      console.log(GameServerEventType.BUILD_CARD, data);

      setPlayers(data.players);
      setBoard(data.board);
    },
    [GameServerEventType.BUILD_LANDMARK]: (data) => {
      console.log(GameServerEventType.BUILD_LANDMARK, data);

      setPlayers(data.players);
    },
    [GameServerEventType.CHANGE_ACTIVE_PLAYER_INDEX]: (data) => {
      console.log(GameServerEventType.CHANGE_ACTIVE_PLAYER_INDEX, data);

      setActivePlayerIndex(data.index);
      setDices([]);
    },
    [GameServerEventType.WAIT_ACTION]: (waitingAction) => {
      console.log(GameServerEventType.WAIT_ACTION, waitingAction);

      setWaitingAction(waitingAction);
    },
    [GameServerEventType.HARBOR_EFFECT]: (withHarborEffect) => {
      console.log(GameServerEventType.HARBOR_EFFECT, withHarborEffect);

      setWithHarborEffect(withHarborEffect);
    },
  });

  useEffect(() => {
    console.log(gameInfo);
  }, [gameInfo]);

  return (
    <>
      <Flex direction="column" between={5}>
        <Flex className={styles.players}>
          {otherPlayers.map((player) => (
            <Player
              key={player.login}
              player={player}
              active={player.index === activePlayerIndex}
              dices={player.index === activePlayerIndex ? dices : []}
              forbiddenToClickCardTypes={FORBIDDEN_TO_SWAP_CARD_TYPES}
              onEndTurn={endTurn}
              onCardClick={getCardClickHandler(player.index)}
              onLandmarkBuild={buildLandmark}
              onClick={player.index === activePlayerIndex ? undefined : () => choosePlayer(player.index)}
            />
          ))}
        </Flex>

        {player && (
          <Player
            className={styles.activePlayer}
            key={player.login}
            player={player}
            main
            active={player.index === activePlayerIndex}
            dices={player.index === activePlayerIndex ? dices : []}
            withActions={isActive && !isWaitingForAction}
            forbiddenToClickCardTypes={FORBIDDEN_TO_SWAP_CARD_TYPES}
            onEndTurn={endTurn}
            onCardClick={getCardClickHandler(player.index)}
            onLandmarkBuild={buildLandmark}
            onClick={player.index === activePlayerIndex ? undefined : () => choosePlayer(player.index)}
          />
        )}

        <Board
          board={board}
          withActions={isActive && !isWaitingForAction}
          availableCoins={player?.data.coins ?? 0}
          builtMajors={player?.data.cardsIds.filter((cardId) => getCard(cardId).type === CardType.MAJOR) ?? []}
          onSelect={buildCard}
        />
      </Flex>

      {player && (
        <StatusAndActions
          className={styles.statusAndActions}
          activePlayer={players[activePlayerIndex]}
          isPlayerActive={isActive}
          dices={dices}
          withHarborEffect={withHarborEffect}
          waitingAction={waitingAction}
          winner={gameResult === null ? null : players[gameResult].login}
          onEndTurn={endTurn}
          onSelectDicesCount={chooseDicesCount}
          onSelectNeedToReroll={chooseNeedToReroll}
          onSelectNeedToUseHarbor={chooseNeedToUseHarbor}
          onSelectPublisherTarget={choosePublisherTarget}
        />
      )}
    </>
  );
};

export default memo(GameContent);
