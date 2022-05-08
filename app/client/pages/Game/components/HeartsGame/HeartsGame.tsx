import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import block from 'bem-cn';
import { useRecoilValue } from 'recoil';
import { unstable_batchedUpdates as batchedUpdates } from 'react-dom';
import { ArrowLeft, ArrowRight } from '@material-ui/icons';

import {
  EGameEvent,
  EHandStage,
  EPassDirection,
  IChooseCardEvent,
  IPlayer,
  IGame,
  IHandPlayerData,
  ITurnPlayerData,
} from 'common/types/hearts';
import { ESuit } from 'common/types/cards';

import { isDeuceOfClubs } from 'common/utilities/hearts';
import getPlayerPosition from 'client/pages/Game/components/HeartsGame/utilities/getPlayerPosition';

import Box from 'client/components/common/Box/Box';
import Player from 'client/pages/Game/components/HeartsGame/components/Player/Player';

import userAtom from 'client/atoms/userAtom';

interface IHeartsGameProps {
  io: SocketIOClient.Socket;
  isGameEnd: boolean;
}

const b = block('HeartsGame');

const Root = styled(Box)`
  flex-grow: 1;
  position: relative;

  .HeartsGame {
    &__player {
      --offset: 40px;
      position: absolute;

      &_bottom,
      &_top {
        left: var(--offset);
        right: var(--offset);
      }

      &_bottom {
        bottom: 0;
        z-index: 10;
      }

      &_top {
        top: 0;
      }

      &_left,
      &_right {
        top: var(--offset);
        bottom: var(--offset);
      }

      &_left {
        left: 0;
      }

      &_right {
        right: 0;
      }
    }

    &__direction {
      width: 200px;
      height: 200px;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }
`;

const HeartsGame: React.FC<IHeartsGameProps> = (props) => {
  const { io } = props;

  const [players, setPlayers] = useState<IPlayer[]>([]);
  const [activePlayerIndex, setActivePlayerIndex] = useState(-1);
  const [handPlayersData, setHandPlayersData] = useState<IHandPlayerData[] | null>(null);
  const [turnPlayersData, setTurnPlayersData] = useState<ITurnPlayerData[] | null>(null);
  const [stage, setStage] = useState<EHandStage>(EHandStage.PASS);
  const [heartsEnteredPlay, setHeartsEnteredPlay] = useState(false);
  const [playedSuit, setPlayedSuit] = useState<ESuit | null>(null);
  const [isFirstTurn, setIsFirstTurn] = useState(true);
  const [passDirection, setPassDirection] = useState<EPassDirection>(EPassDirection.NONE);
  const user = useRecoilValue(userAtom);

  const player = useMemo(() => players.find(({ login }) => login === user?.login), [players, user]);

  const sortedPlayers = useMemo(() => {
    if (!player) {
      return [];
    }

    const playerIndex = players.indexOf(player);

    return [
      player,
      ...players.slice(playerIndex + 1),
      ...players.slice(0, playerIndex),
    ];
  }, [player, players]);

  const selectCard = useCallback((cardIndex: number) => {
    const data: IChooseCardEvent = {
      cardIndex,
    };

    io.emit(EGameEvent.CHOOSE_CARD, data);
  }, [io]);

  const directionBlock = useMemo(() => {
    return passDirection === EPassDirection.LEFT ?
      <ArrowLeft className={b('direction').toString()} /> :
      <ArrowRight className={b('direction').toString()} />;
  }, [passDirection]);

  useEffect(() => {
    io.emit(EGameEvent.GET_ROOT_STATE);

    io.on(EGameEvent.ROOT_INFO, (game: IGame) => {
      if (!user) {
        return;
      }

      console.log(EGameEvent.ROOT_INFO, game);

      batchedUpdates(() => {
        setPlayers(game.players);
        setHandPlayersData(game.hand?.playersData ?? null);
        setTurnPlayersData(game.hand?.turn?.playersData ?? null);
        setActivePlayerIndex(game.hand?.turn?.activePlayerIndex ?? -1);
        setStage(game.hand?.stage ?? EHandStage.PASS);
        setHeartsEnteredPlay(game.hand?.heartsEnteredPlay ?? false);
        setPlayedSuit(game.hand?.turn?.playersData[game.hand.turn.startPlayerIndex].playedCard?.suit ?? null);
        setIsFirstTurn(game.hand?.turn?.playersData.some(({ playedCard }) => isDeuceOfClubs(playedCard)) ?? false);
        setPassDirection(game.passDirection);
      });
    });

    return () => {
      io.off(EGameEvent.GET_ROOT_STATE);
    };
  }, [io, user]);

  if (!player) {
    return null;
  }

  return (
    <Root className={b()}>
      {sortedPlayers.map((localPlayer, index) => {
        const position = getPlayerPosition(index, players.length);

        return (
          <Player
            key={localPlayer.login}
            className={b('player', { [position]: true })}
            player={localPlayer}
            position={position}
            isActive={localPlayer.index === activePlayerIndex}
            hand={handPlayersData?.[localPlayer.index].hand ?? []}
            chosenCardsIndexes={handPlayersData?.[localPlayer.index].chosenCardsIndexes ?? []}
            playedCard={turnPlayersData?.[localPlayer.index].playedCard ?? null}
            stage={stage}
            playedSuit={playedSuit}
            heartsEnteredPlay={heartsEnteredPlay}
            isOwnHand={localPlayer === player}
            isFirstTurn={isFirstTurn}
            onSelectCard={selectCard}
          />
        );
      })}

      {stage === EHandStage.PASS && directionBlock}
    </Root>
  );
};

export default React.memo(HeartsGame);
