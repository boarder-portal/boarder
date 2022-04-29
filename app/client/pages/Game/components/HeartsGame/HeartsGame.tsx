import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import block from 'bem-cn';
import { useRecoilValue } from 'recoil';

import { EGameEvent, EHandStage, IChooseCardEvent, IGameInfoEvent, IPlayer } from 'common/types/hearts';
import { ESuit } from 'common/types/cards';

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
    io.emit(EGameEvent.GET_GAME_INFO);

    io.on(EGameEvent.GAME_INFO, (gameInfo: IGameInfoEvent) => {
      if (!user) {
        return;
      }

      console.log(EGameEvent.GAME_INFO, gameInfo);

      setPlayers(gameInfo.players);
      setStage(gameInfo.stage);
      setHeartsEnteredPlay(gameInfo.heartsEnteredPlay);
      setPlayedSuit(gameInfo.players[gameInfo.startTurnPlayerIndex].playedCard?.suit ?? null);
      setIsFirstTurn(gameInfo.isFirstTurn);
    });

    return () => {
      io.off(EGameEvent.GAME_INFO);
    };
  }, [io, user]);

  if (!player) {
    return null;
  }

  return (
    <Root className={b()} >
      {sortedPlayers.map((localPlayer, index) => (
        <Hand
          key={localPlayer.login}
          className={b('player', { [index]: true })}
          player={localPlayer}
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
