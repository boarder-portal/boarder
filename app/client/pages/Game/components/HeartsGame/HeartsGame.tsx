import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import block from 'bem-cn';
import { useRecoilValue } from 'recoil';
import { unstable_batchedUpdates as batchedUpdates } from 'react-dom';

import { EGameEvent, EHandStage, IChooseCardEvent, IPlayer, IRootState } from 'common/types/hearts';
import { ESuit, ICard } from 'common/types/cards';

import { isDeuceOfClubs } from 'common/utilities/hearts';

import Box from 'client/components/common/Box/Box';
import Hand from 'client/pages/Game/components/HeartsGame/components/Hand/Hand';

import userAtom from 'client/atoms/userAtom';

interface IHeartsGameProps {
  io: SocketIOClient.Socket;
  isGameEnd: boolean;
}

const b = block('HeartsGame');

const Root = styled(Box)`
  .HeartsGame {
    &__player {
      position: absolute;

      &_0 {
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
      }

      &_1 {
        left: 0;
        top: 50%;
        transform: translateX(-50%) rotate(90deg) translateY(-50%) translateY(-20px)
      }

      &_2 {
        left: 50%;
        top: 20px;
        transform: translateX(-50%) rotate(180deg);
      }
    }

    &__score {
      margin-left: auto;
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
      {sortedPlayers.map((localPlayer, index) => (
        <Hand
          key={localPlayer.login}
          className={b('player', { [index]: true })}
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
      ))}

      <Box className={b('score')} flex column between={2} mt={100}>
        {players.map((p) => (
          <div key={p.login}>{p.login}: {p.score}</div>
        ))}
      </Box>
    </Root>
  );
};

export default React.memo(HeartsGame);
