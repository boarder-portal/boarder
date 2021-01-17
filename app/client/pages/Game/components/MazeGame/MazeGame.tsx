import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import block from 'bem-cn';

import { GAMES_CONFIG } from 'common/constants/gamesConfig';

import {
  EMazeGameEvent,
  EMazePlayerSide,
  ESide,
  IMazeGameInfo,
  IMazePlayer,
  IMazePlayerMoveEvent,
  IMazeWall,
} from 'common/types/maze';
import { EGame } from 'common/types/game';

import Vector from 'common/utilities/Vector';

import Box from 'client/components/common/Box/Box';
import GameEnd from 'client/pages/Game/components/GameEnd/GameEnd';

import useGlobalListener from 'client/hooks/useGlobalListener';

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
      playerSize,
    },
  },
} = GAMES_CONFIG;

const PLAYER_COLORS: Record<EMazePlayerSide, string> = {
  [EMazePlayerSide.TOP]: '#00f',
  [EMazePlayerSide.BOTTOM]: '#f00',
};

const KEY_CODE_DIRECTIONS: Partial<Record<string, ESide>> = {
  ArrowUp: ESide.TOP,
  ArrowRight: ESide.RIGHT,
  ArrowDown: ESide.BOTTOM,
  ArrowLeft: ESide.LEFT,
  w: ESide.TOP,
  d: ESide.RIGHT,
  s: ESide.BOTTOM,
  a: ESide.LEFT,
};

const getDirectionAngle = (directions: ESide[]): number | null => {
  if (directions.length === 0) {
    return null;
  }

  let xProjection = 0;
  let yProjection = 0;

  directions.forEach((direction) => {
    if (direction === ESide.TOP) {
      yProjection = -1;
    } else if (direction === ESide.BOTTOM) {
      yProjection = +1;
    } else if (direction === ESide.LEFT) {
      xProjection = -1;
    } else if (direction === ESide.RIGHT) {
      xProjection = +1;
    }
  });

  return new Vector({ x: xProjection, y: yProjection }).getAngle();
};

const getPlayerElementProps = (player: IMazePlayer): { x: number; y: number } => {
  return {
    x: player.x * cellSize - playerSize / 2,
    y: player.y * cellSize - playerSize / 2,
  };
};

const MazeGame: React.FC<IMazeGameProps> = (props) => {
  const {
    io,
    isGameEnd,
  } = props;

  const currentDirections = useRef<ESide[]>([]);
  const players = useRef<IMazePlayer[]>([]);

  const [walls, setWalls] = useState<IMazeWall[] | null>(null);

  const renderPlayer = (player: IMazePlayer) => {
    const playerElement = document.getElementById(`player-${player.side}`);

    if (playerElement && playerElement instanceof SVGRectElement) {
      const props = getPlayerElementProps(player);

      playerElement.setAttribute('x', String(props.x));
      playerElement.setAttribute('y', String(props.y));
    }
  };

  useEffect(() => {
    io.emit(EMazeGameEvent.GET_GAME_INFO);

    io.on(EMazeGameEvent.GAME_INFO, (mazeGameInfo: IMazeGameInfo) => {
      players.current = mazeGameInfo.players;

      players.current.forEach(renderPlayer);

      setWalls(mazeGameInfo.walls);
    });

    io.on(EMazeGameEvent.PLAYER_MOVED, (moveEvent: IMazePlayerMoveEvent) => {
      const player = players.current.find(
        ({ login }) => login === moveEvent.login,
      );

      if (!player) {
        return;
      }

      player.x = moveEvent.x;
      player.y = moveEvent.y;

      renderPlayer(player);
    });

    return () => {
      io.off(EMazeGameEvent.GAME_INFO);
      io.off(EMazeGameEvent.PLAYER_MOVED);
    };
  }, [io]);

  useGlobalListener('keydown', document, (e) => {
    const direction = KEY_CODE_DIRECTIONS[e.key];

    if (!direction) {
      return;
    }

    const directionIndex = currentDirections.current.indexOf(direction);

    if (directionIndex !== -1) {
      return;
    }

    currentDirections.current.push(direction);

    const newDirection = getDirectionAngle(currentDirections.current);

    if (newDirection !== null) {
      io.emit(EMazeGameEvent.MOVE_PLAYER, newDirection);
    }
  });

  useGlobalListener('keyup', document, (e) => {
    const direction = KEY_CODE_DIRECTIONS[e.key];

    if (!direction) {
      return;
    }

    const directionIndex = currentDirections.current.indexOf(direction);

    if (directionIndex === -1) {
      return;
    }

    currentDirections.current.splice(directionIndex, 1);

    const newDirection = getDirectionAngle(currentDirections.current);

    if (newDirection === null) {
      io.emit(EMazeGameEvent.STOP_PLAYER);
    } else {
      io.emit(EMazeGameEvent.MOVE_PLAYER, newDirection);
    }
  });

  if (isGameEnd) {
    return (
      <GameEnd>

      </GameEnd>
    );
  }

  if (!walls) {
    return null;
  }

  // console.log(mazeInfo);

  return (
    <Root className={b()}>
      <svg
        className={b('maze')}
        style={{
          width: mazeWidth * cellSize,
          height: mazeHeight * cellSize,
        }}
      >
        <g>
          {walls.map((wall) => (
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
        </g>

        <g>
          {players.current.map((player) => (
            <rect
              key={player.side}
              id={`player-${player.side}`}
              width={playerSize}
              height={playerSize}
              fill={PLAYER_COLORS[player.side]}
              {...getPlayerElementProps(player)}
            />
          ))}
        </g>
      </svg>
    </Root>
  );
};

export default React.memo(MazeGame);
