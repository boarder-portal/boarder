import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import block from 'bem-cn';
import { useRecoilValue } from 'recoil';
import { unstable_batchedUpdates as batchedUpdates } from 'react-dom';
import { ArrowLeft, ArrowRight } from '@material-ui/icons';

import { EGameEvent, EHandStage, EPassDirection, IChooseCardEvent, IPlayer, IRootState } from 'common/types/hearts';
import { ESuit, ICard } from 'common/types/cards';

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
  const [hands, setHands] = useState<ICard[][]>([]);
  const [chosenCardsIndexes, setChosenCardsIndexes] = useState<number[][]>([]);
  const [playedCards, setPlayedCards] = useState<(ICard | null)[]>([]);
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

    io.on(EGameEvent.ROOT_STATE, (rootState: IRootState) => {
      if (!user) {
        return;
      }

      console.log(EGameEvent.ROOT_STATE, rootState);

      batchedUpdates(() => {
        setPlayers(rootState.players);
        setHands(rootState.handState.hands);
        setChosenCardsIndexes(rootState.handState.chosenCardsIndexes);
        setPlayedCards(rootState.handState.turnState.playedCards);
        setActivePlayerIndex(rootState.handState.turnState.activePlayerIndex);
        setStage(rootState.handState.stage);
        setHeartsEnteredPlay(rootState.handState.heartsEnteredPlay);
        setPlayedSuit(rootState.handState.turnState.playedCards[rootState.handState.turnState.startPlayerIndex]?.suit ?? null);
        setIsFirstTurn(rootState.handState.turnState.playedCards.some(isDeuceOfClubs));
        setPassDirection(rootState.passDirection);
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
            hand={hands[localPlayer.index]}
            chosenCardsIndexes={chosenCardsIndexes[localPlayer.index]}
            playedCard={playedCards[localPlayer.index]}
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
