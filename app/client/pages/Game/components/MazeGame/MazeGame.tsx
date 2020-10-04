import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import block from 'bem-cn';

import { GAMES_CONFIG } from 'common/constants/gamesConfig';

import { EMazeGameEvent, IMazeGameInfo, IMazePlayer } from 'common/types/maze';
import { EGame } from 'common/types';
import { EGameEvent } from 'common/types/game';

import Box from 'client/components/common/Box/Box';
import GameEnd from 'client/pages/Game/components/GameEnd/GameEnd';

interface IMazeGameProps {
  io: SocketIOClient.Socket;
  players: IMazePlayer[];
  isGameEnd: boolean;
}

const b = block('MazeGame');

const Root = styled(Box)`
  .MazeGame {
    &__maze {
      overflow: visible;
    }

    &__wall {
      stroke: black;
    }
  }
`;

const {
  games: {
    [EGame.MAZE]: {
      mazeWidth,
      mazeHeight,
      cellSize,
      wallThickness,
    },
  },
} = GAMES_CONFIG;

const MazeGame: React.FC<IMazeGameProps> = (props) => {
  const {
    io,
    isGameEnd,
  } = props;

  const [mazeInfo, setMazeInfo] = useState<IMazeGameInfo | null>(null);

  useEffect(() => {
    io.emit(EGameEvent.GAME_EVENT, EMazeGameEvent.GET_GAME_INFO);

    io.on(EMazeGameEvent.GAME_INFO, (mazeGameInfo: IMazeGameInfo) => {
      setMazeInfo(mazeGameInfo);
    });
  }, [io]);

  if (isGameEnd) {
    return (
      <GameEnd>

      </GameEnd>
    );
  }

  if (!mazeInfo) {
    return null;
  }

  console.log(mazeInfo);

  return (
    <Root className={b()}>
      <svg
        className={b('maze')}
        style={{
          width: mazeWidth * cellSize,
          height: mazeHeight * cellSize,
        }}
      >
        {mazeInfo.walls.map((wall) => (
          <line
            key={`${wall.from.x}x${wall.from.y} - ${wall.to.x}x${wall.to.y}`}
            className={b('wall')}
            style={{
              strokeWidth: wallThickness,
            }}
            x1={wall.from.x * cellSize}
            y1={wall.from.y * cellSize}
            x2={wall.to.x * cellSize}
            y2={wall.to.y * cellSize}
          />
        ))}
      </svg>
    </Root>
  );
};

export default React.memo(MazeGame);
