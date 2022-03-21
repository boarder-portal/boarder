import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import block from 'bem-cn';
import { useRecoilValue } from 'recoil';

import { GAMES_CONFIG } from 'common/constants/gamesConfig';

import { EGame } from 'common/types/game';
import {
  ESevenWondersGameEvent,
  ISevenWondersBuildCardEvent,
  ISevenWondersGameInfoEvent,
  ISevenWondersPlayer,
} from 'common/types/sevenWonders';
import { ISevenWondersCard } from 'common/types/sevenWonders/cards';

import Box from 'client/components/common/Box/Box';
import Card from 'client/pages/Game/components/SevenWondersGame/components/Card/Card';

import userAtom from 'client/atoms/userAtom';

interface ISevenWondersGameProps {
  io: SocketIOClient.Socket;
  isGameEnd: boolean;
}

const {
  games: {
    [EGame.SEVEN_WONDERS]: {

    },
  },
} = GAMES_CONFIG;

const b = block('SevenWondersGame');

const Root = styled(Box)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: beige;
  padding: 12px;

  .SevenWondersGame {
    &__otherPlayers {
      display: grid;
      grid-column-gap: 20px;
    }

    &__otherPlayerCity {
      width: 100%;
    }

    &__ownBoard {
      margin-top: auto;
    }

    &__city {
      max-width: 700px;
    }
  }
`;

const SevenWondersGame: React.FC<ISevenWondersGameProps> = (props) => {
  const { io, isGameEnd } = props;

  const [players, setPlayers] = useState<ISevenWondersPlayer[]>([]);

  const user = useRecoilValue(userAtom);

  const player = useMemo(() => players.find(({ login }) => login === user?.login), [players, user]);
  const otherPlayers = useMemo(() => players.filter((p) => p !== player), [player, players]);

  useEffect(() => {
    io.emit(ESevenWondersGameEvent.GET_GAME_INFO);

    io.on(ESevenWondersGameEvent.GAME_INFO, (gameInfo: ISevenWondersGameInfoEvent) => {
      if (!user) {
        return;
      }

      console.log(ESevenWondersGameEvent.GAME_INFO, gameInfo);

      setPlayers(gameInfo.players);
    });

    return () => {
      io.off(ESevenWondersGameEvent.GAME_INFO);
    };
  }, [io, user]);

  const handleBuildCard = useCallback((card: ISevenWondersCard) => {
    const data: ISevenWondersBuildCardEvent = {
      card,
    };

    io.emit(ESevenWondersGameEvent.BUILD_CARD, data);
  }, [io]);

  if (!player) {
    return null;
  }

  return (
    <Root className={b()} flex column>
      <div
        className={b('otherPlayers')}
        style={{ gridTemplateColumns: `repeat(${otherPlayers.length}, 1fr)` }}
      >
        {otherPlayers.map((otherPlayer) => (
          <div key={otherPlayer.login} className={b('otherPlayer')}>
            <img className={b('otherPlayerCity')} src={`/sevenWonders/cities/${otherPlayer.city}/${otherPlayer.citySide}.png`} />
          </div>
        ))}
      </div>

      <Box className={b('ownBoard')} flex alignItems="center" column between={20}>
        <img className={b('city')} src={`/sevenWonders/cities/${player.city}/${player.citySide}.png`} />

        <Box flex between={-35}>
          {player.hand.map((card, index) => (
            <Card key={index} card={card} onBuild={handleBuildCard} />
          ))}
        </Box>
      </Box>
    </Root>
  );
};

export default React.memo(SevenWondersGame);
