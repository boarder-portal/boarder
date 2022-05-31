import { FC, memo, useCallback, useEffect, useMemo, useState } from 'react';
import { unstable_batchedUpdates as batchedUpdates } from 'react-dom';

import { EGame } from 'common/types/game';
import {
  ECardId,
  ECardType,
  EGameClientEvent,
  EGameServerEvent,
  ELandmarkId,
  EPlayerWaitingAction,
} from 'common/types/machiKoro';

import getCard from 'common/utilities/machiKoro/getCard';

import Flex from 'client/components/common/Flex/Flex';
import Board from 'client/pages/Game/components/MachiKoroGame/components/Board/Board';
import Player from 'client/pages/Game/components/MachiKoroGame/components/Player/Player';
import StatusAndActions from 'client/pages/Game/components/MachiKoroGame/components/StatusAndActions/StatusAndActions';

import { IGameProps } from 'client/pages/Game/Game';
import useSocket from 'client/hooks/useSocket';
import useAtom from 'client/hooks/useAtom';

import styles from './MachiKoroGame.pcss';

const FORBIDDEN_TO_SWAP_CARD_TYPES: ECardType[] = [ECardType.MAJOR];

interface ICardsToSwap {
  from: {
    cardId: ECardId;
    playerIndex: number;
  } | null;
  toCardId: ECardId | null;
}

const MachiKoroGame: FC<IGameProps<EGame.MACHI_KORO>> = (props) => {
  const { io, gameInfo, gameResult } = props;

  const [user] = useAtom('user');
  const [board, setBoard] = useState(gameInfo.board);
  const [players, setPlayers] = useState(gameInfo.players);
  const [activePlayerIndex, setActivePlayerIndex] = useState(gameInfo.activePlayerIndex);
  const [dices, setDices] = useState(gameInfo.dices);
  const [cardsToSwap, setCardsToSwap] = useState<ICardsToSwap>({ from: null, toCardId: null });

  const isActive = useMemo(
    () => players[activePlayerIndex].login === user?.login,
    [activePlayerIndex, players, user?.login],
  );

  const player = useMemo(() => players.find((p) => p.login === user?.login), [players, user?.login]);

  const otherPlayers = useMemo(() => {
    const playerIndex = players.findIndex(({ login }) => login === player?.login);

    return [...players.slice(playerIndex + 1), ...players.slice(0, playerIndex)];
  }, [player, players]);

  const waitingAction = player?.data.waitingAction;
  const isWaitingForAction = Boolean(waitingAction);

  const buildCard = useCallback(
    (cardId: ECardId) => {
      io.emit(EGameClientEvent.BUILD_CARD, cardId);
    },
    [io],
  );

  const buildLandmark = useCallback(
    (cardId: ELandmarkId) => {
      io.emit(EGameClientEvent.BUILD_LANDMARK, cardId);
    },
    [io],
  );

  const endTurn = useCallback(() => {
    io.emit(EGameClientEvent.END_TURN);
  }, [io]);

  const choosePlayer = useCallback(
    (playerIndex: number) => {
      if (waitingAction === EPlayerWaitingAction.CHOOSE_PLAYER) {
        io.emit(EGameClientEvent.CHOOSE_PLAYER, playerIndex);
      }
    },
    [io, waitingAction],
  );

  const chooseDicesCount = useCallback(
    (count: number) => {
      io.emit(EGameClientEvent.DICES_COUNT, count);
    },
    [io],
  );

  const chooseNeedToReroll = useCallback(
    (needToReroll: boolean) => {
      io.emit(EGameClientEvent.NEED_TO_REROLL, needToReroll);
    },
    [io],
  );

  const getCardClickHandler = useCallback(
    (playerIndex: number) => {
      if (waitingAction === EPlayerWaitingAction.CHOOSE_CARDS_TO_SWAP) {
        if (!cardsToSwap.from) {
          if (playerIndex !== activePlayerIndex) {
            return (playerIndex: number, cardId: ECardId) => {
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
          return (playerIndex: number, cardId: ECardId) => {
            if (!cardsToSwap.from) {
              return;
            }

            io.emit(EGameClientEvent.CARDS_TO_SWAP, {
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

  useSocket(io, {
    [EGameServerEvent.UPDATE_PLAYERS]: (data) => {
      console.log(EGameServerEvent.UPDATE_PLAYERS, data);
      setPlayers(data);
    },

    [EGameServerEvent.DICES_ROLL]: (data) => {
      console.log(EGameServerEvent.DICES_ROLL, data);
      setDices(data);
    },
    [EGameServerEvent.CARDS_EFFECTS_RESULTS]: (data) => {
      console.log(EGameServerEvent.CARDS_EFFECTS_RESULTS, data);
      setPlayers(data.players);
    },
    [EGameServerEvent.BUILD_CARD]: (data) => {
      console.log(EGameServerEvent.BUILD_CARD, data);

      batchedUpdates(() => {
        setPlayers(data.players);
        setBoard(data.board);
      });
    },
    [EGameServerEvent.BUILD_LANDMARK]: (data) => {
      console.log(EGameServerEvent.BUILD_LANDMARK, data);

      setPlayers(data.players);
    },
    [EGameServerEvent.CHANGE_ACTIVE_PLAYER_INDEX]: (data) => {
      console.log(EGameServerEvent.CHANGE_ACTIVE_PLAYER_INDEX, data);

      batchedUpdates(() => {
        setActivePlayerIndex(data.index);
        setDices([]);
      });
    },
    [EGameServerEvent.WAIT_ACTION]: (data) => {
      console.log(EGameServerEvent.WAIT_ACTION, data);

      setPlayers(data.players);
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
          availableCoins={player?.data.coins || 0}
          builtMajors={player?.data.cardsIds.filter((cardId) => getCard(cardId).type === ECardType.MAJOR) || []}
          onSelect={buildCard}
        />
      </Flex>

      {player && (
        <StatusAndActions
          className={styles.statusAndActions}
          player={player}
          activePlayer={players[activePlayerIndex]}
          isPlayerActive={isActive}
          dices={dices}
          winner={gameResult === null ? null : players[gameResult].login}
          onEndTurn={endTurn}
          onSelectDicesCount={chooseDicesCount}
          onSelectNeedToReroll={chooseNeedToReroll}
        />
      )}
    </>
  );
};

export default memo(MachiKoroGame);
