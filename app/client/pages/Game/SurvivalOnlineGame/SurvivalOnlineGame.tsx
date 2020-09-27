import React, { useEffect, useRef, useState } from 'react';
import times from 'lodash/times';
import styled from 'styled-components';
import block from 'bem-cn';
import { useRecoilValue } from 'recoil';

import { GAMES_CONFIG } from 'common/constants/gamesConfig';

import { EGameEvent } from 'common/types/game';
import {
  ESurvivalOnlineBiome,
  ESurvivalOnlineDirection,
  ESurvivalOnlineGameEvent,
  ESurvivalOnlineObject,
  ISurvivalOnlineCell,
  ISurvivalOnlineGameInfoEvent,
  ISurvivalOnlinePlayer,
  ISurvivalOnlinePlayerObject,
  ISurvivalOnlineZombieObject,
} from 'common/types/survivalOnline';
import { EGame } from 'common/types';

import Box from 'client/components/common/Box/Box';

import userAtom from 'client/atoms/userAtom';

interface IRectInfo {
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ISurvivalOnlineGameProps {
  io: SocketIOClient.Socket;
}

const MOVES_KEY_CODES = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'];

const {
  games: {
    [EGame.SURVIVAL_ONLINE]: {
      viewSize,
      cellSize,
    },
  },
} = GAMES_CONFIG;

const b = block('SurvivalOnlineGame');

const Root = styled(Box)`
  background: black;
  flex-grow: 1;
  width: 100%;
  margin-bottom: 40px;

  .SurvivalOnlineGame {

  }
`;

function renderRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, color: string) {
  context.fillStyle = color;
  context.fillRect(x, y, width, height);
}

function renderRects(context: CanvasRenderingContext2D, startX: number, startY: number, rectsInfo: IRectInfo[]) {
  rectsInfo.forEach(({ color, x, y, height, width }) => {
    renderRect(context, startX + cellSize * x, startY + cellSize * y, width * cellSize, height * cellSize, color);
  });
}

function renderGrass(context: CanvasRenderingContext2D, startX: number, startY: number) {
  renderRects(context, startX, startY, [{ x: 0, y: 0, width: 1, height: 1, color: 'yellowgreen' }]);
}

function renderTree(context: CanvasRenderingContext2D, startX: number, startY: number) {
  renderRects(context, startX, startY, [
    { x: 0, y: 0, width: 1, height: 0.6, color: 'green' },
    { x: 0.3, y: 0.6, width: 0.4, height: 0.4, color: 'brown' },
  ]);
}

function renderEyes(context: CanvasRenderingContext2D, startX: number, startY: number, direction: ESurvivalOnlineDirection, color: string) {
  if (direction === ESurvivalOnlineDirection.DOWN) {
    renderRects(context, startX, startY, [
      { x: 0.2, y: 0.2, width: 0.2, height: 0.2, color },
      { x: 0.6, y: 0.2, width: 0.2, height: 0.2, color },
    ]);
  } else if (direction === ESurvivalOnlineDirection.RIGHT) {
    renderRects(context, startX, startY, [
      { x: 0.6, y: 0.2, width: 0.2, height: 0.2, color },
    ]);
  } else if (direction === ESurvivalOnlineDirection.LEFT) {
    renderRects(context, startX, startY, [
      { x: 0.2, y: 0.2, width: 0.2, height: 0.2, color },
    ]);
  }
}

function renderPlayer(context: CanvasRenderingContext2D, startX: number, startY: number, object: ISurvivalOnlinePlayerObject) {
  renderRects(context, startX, startY, [{ x: 0, y: 0, width: 1, height: 1, color: 'black' }]);

  renderEyes(context, startX, startY, object.direction, '#ffffff');
}

function renderBase(context: CanvasRenderingContext2D, startX: number, startY: number) {
  renderRects(context, startX, startY, [
    { x: 0, y: 0, width: 1, height: 1, color: '#000000' },
    { x: 0.2, y: 0.2, width: 0.6, height: 0.6, color: '#98643d' },
    { x: 0.4, y: 0.4, width: 0.2, height: 0.2, color: '#ffc800' },
  ]);
}

function renderZombie(context: CanvasRenderingContext2D, startX: number, startY: number, object: ISurvivalOnlineZombieObject) {
  renderRects(context, startX, startY, [{ x: 0, y: 0, width: 1, height: 1, color: '#a52a2a' }]);

  renderEyes(context, startX, startY, object.direction, '#ff0000');
}

function renderCell(context: CanvasRenderingContext2D, startX: number, startY: number, cell: ISurvivalOnlineCell | undefined) {
  if (!cell) {
    return;
  }

  const { biome, object } = cell;

  if (biome === ESurvivalOnlineBiome.GRASS) {
    renderGrass(context, startX, startY);
  }

  if (!object) {
    return;
  }

  if (object.type === ESurvivalOnlineObject.TREE) {
    renderTree(context, startX, startY);
  } else if (object.type === ESurvivalOnlineObject.PLAYER) {
    renderPlayer(context, startX, startY, object);
  } else if (object.type === ESurvivalOnlineObject.BASE) {
    renderBase(context, startX, startY);
  } else if (object.type === ESurvivalOnlineObject.ZOMBIE) {
    renderZombie(context, startX, startY, object);
  }
}

function renderMap({
  context,
  gameInfo,
  player,
}: {
  context: CanvasRenderingContext2D;
  gameInfo: ISurvivalOnlineGameInfoEvent;
  player: ISurvivalOnlinePlayer;
}) {
  context.clearRect(0, 0, viewSize.width * cellSize, viewSize.height * cellSize);

  const startX = player.x - Math.floor(viewSize.width / 2);
  const startY = player.y - Math.floor(viewSize.height / 2);

  const { map } = gameInfo;

  times(viewSize.height, (y) => {
    times(viewSize.width, (x) => {
      const cellX = startX + x;
      const cellY = startY + y;

      const cell = map[cellY]?.[cellX];

      renderCell(context, x * cellSize, y * cellSize, cell);
    });
  });
}

function getCellScreenSize(containerEl: HTMLDivElement) {
  const cellWidth = containerEl.offsetWidth / viewSize.width;
  const cellHeight = containerEl.offsetHeight / viewSize.height;

  return Math.floor(Math.min(cellWidth, cellHeight));
}

const SurvivalOnlineGame: React.FC<ISurvivalOnlineGameProps> = (props) => {
  const { io } = props;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const gameInfoRef = useRef<ISurvivalOnlineGameInfoEvent | null>(null);
  const playerRef = useRef<ISurvivalOnlinePlayer | null>(null);
  const [canvasSize, setCanvasSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  const user = useRecoilValue(userAtom);

  useEffect(() => {
    io.emit(EGameEvent.GAME_EVENT, ESurvivalOnlineGameEvent.GET_GAME_INFO);

    io.on(ESurvivalOnlineGameEvent.GAME_INFO, (gameInfo: ISurvivalOnlineGameInfoEvent) => {
      console.log('GAME_INFO', gameInfo);

      gameInfoRef.current = gameInfo;

      const context = contextRef.current;

      if (!context || !user) {
        return;
      }

      const player = playerRef.current = gameInfo.players.find(({ login }) => login === user.login) || null;

      if (!player) {
        return;
      }

      renderMap({ context, gameInfo, player });
    });

    io.on(
      ESurvivalOnlineGameEvent.UPDATE_GAME,
      ({ players, cells }: {
        players: ISurvivalOnlinePlayer[] | null;
        cells: ISurvivalOnlineCell[];
      }) => {
        console.log('UPDATE_GAME', { players, cells });

        const context = contextRef.current;
        const gameInfo = gameInfoRef.current;

        if (!gameInfo || !context || !user) {
          return;
        }

        if (players) {
          gameInfo.players = players;

          playerRef.current = gameInfo.players.find(({ login }) => login === user.login) || null;
        }

        cells.forEach((cell) => {
          gameInfo.map[cell.y][cell.x] = cell;
        });

        if (!playerRef.current) {
          return;
        }

        renderMap({
          context,
          gameInfo,
          player: playerRef.current,
        });
      });
  }, [io, user]);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    const containerEl = containerRef.current;

    if (!canvasEl || !containerEl) {
      return;
    }

    contextRef.current = canvasEl.getContext('2d');

    const cellSize = getCellScreenSize(containerEl);

    setCanvasSize({
      width: viewSize.width * cellSize,
      height: viewSize.height * cellSize,
    });

    document.addEventListener('keydown', (e) => {
      if (MOVES_KEY_CODES.includes(e.key)) {
        io.emit(
          EGameEvent.GAME_EVENT,
          ESurvivalOnlineGameEvent.MOVE_PLAYER,
          e.key === 'ArrowUp' ?
            ESurvivalOnlineDirection.UP :
            e.key === 'ArrowRight' ?
              ESurvivalOnlineDirection.RIGHT :
              e.key === 'ArrowDown' ?
                ESurvivalOnlineDirection.DOWN :
                ESurvivalOnlineDirection.LEFT,
        );
      }
    });

    window.addEventListener('resize', () => {
      const cellSize = getCellScreenSize(containerEl);

      setCanvasSize({
        width: viewSize.width * cellSize,
        height: viewSize.height * cellSize,
      });
    });
  }, [io]);

  return (
    <Root
      className={b()}
      flex
      justifyContent="center"
      alignItems="center"
      column
      innerRef={containerRef}
    >
      <canvas
        style={{ width: canvasSize.width, height: canvasSize.height }}
        width={viewSize.width * cellSize}
        height={viewSize.height * cellSize}
        ref={canvasRef}
      />
    </Root>
  );
};

export default React.memo(SurvivalOnlineGame);
