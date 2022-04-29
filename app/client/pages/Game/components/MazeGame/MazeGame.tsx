import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import block from 'bem-cn';

import {
  CELL_SIZE,
  MAZE_HEIGHT,
  MAZE_WIDTH,
  PLAYER_SIZE,
  WALL_THICKNESS,
} from 'common/constants/games/maze';

import {
  EGameEvent,
  EPlayerSide,
  ESide,
  IGameInfoEvent,
  IPlayer,
  IPlayerMoveEvent,
  IWall,
} from 'common/types/maze';

import Vector from 'common/utilities/Vector';

import Box from 'client/components/common/Box/Box';
import GameEnd from 'client/pages/Game/components/GameEnd/GameEnd';

import useGlobalListener from 'client/hooks/useGlobalListener';

interface IMazeGameProps {
  io: SocketIOClient.Socket;
  players: IPlayer[];
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

const PLAYER_COLORS: Record<EPlayerSide, string> = {
  [EPlayerSide.TOP]: '#00f',
  [EPlayerSide.BOTTOM]: '#f00',
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

const getPlayerElementProps = (player: IPlayer): { x: number; y: number } => {
  return {
    x: player.x * CELL_SIZE - PLAYER_SIZE / 2,
    y: player.y * CELL_SIZE - PLAYER_SIZE / 2,
  };
};

const MazeGame: React.FC<IMazeGameProps> = (props) => {
  const {
    io,
    isGameEnd,
  } = props;

  const currentDirections = useRef<ESide[]>([]);
  const players = useRef<IPlayer[]>([]);

  const [walls, setWalls] = useState<IWall[] | null>(null);

  const renderPlayer = (player: IPlayer) => {
    const playerElement = document.getElementById(`player-${player.side}`);

    if (playerElement && playerElement instanceof SVGRectElement) {
      const props = getPlayerElementProps(player);

      playerElement.setAttribute('x', String(props.x));
      playerElement.setAttribute('y', String(props.y));
    }
  };

  useEffect(() => {
    io.emit(EGameEvent.GET_GAME_INFO);

    io.on(EGameEvent.GAME_INFO, (mazeGameInfo: IGameInfoEvent) => {
      players.current = mazeGameInfo.players;

      players.current.forEach(renderPlayer);

      setWalls(mazeGameInfo.walls);
    });

    io.on(EGameEvent.PLAYER_MOVED, (moveEvent: IPlayerMoveEvent) => {
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
      io.off(EGameEvent.GAME_INFO);
      io.off(EGameEvent.PLAYER_MOVED);
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
      io.emit(EGameEvent.MOVE_PLAYER, newDirection);
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
      io.emit(EGameEvent.STOP_PLAYER);
    } else {
      io.emit(EGameEvent.MOVE_PLAYER, newDirection);
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
          width: MAZE_WIDTH * CELL_SIZE,
          height: MAZE_HEIGHT * CELL_SIZE,
        }}
      >
        <g>
          {walls.map((wall) => (
            <line
              key={`${wall.from.x}x${wall.from.y} - ${wall.to.x}x${wall.to.y}`}
              className={b('wall')}
              style={{
                strokeWidth: WALL_THICKNESS,
              }}
              x1={wall.from.x * CELL_SIZE}
              y1={wall.from.y * CELL_SIZE}
              x2={wall.to.x * CELL_SIZE}
              y2={wall.to.y * CELL_SIZE}
            />
          ))}
        </g>

        <g>
          {players.current.map((player) => (
            <rect
              key={player.side}
              id={`player-${player.side}`}
              width={PLAYER_SIZE}
              height={PLAYER_SIZE}
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
