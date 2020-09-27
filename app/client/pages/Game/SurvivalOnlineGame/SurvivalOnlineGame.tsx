import React, { useEffect, useRef, useState } from 'react';
import times from 'lodash/times';
import styled from 'styled-components';
import block from 'bem-cn';
import { useRecoilValue } from 'recoil';

import { GAMES_CONFIG } from 'common/constants/gamesConfig';

import { EGameEvent } from 'common/types/game';
import {
  ESurvivalOnlineBiome,
  ESurvivalOnlineGameEvent,
  ESurvivalOnlineObject,
  ISurvivalOnlineCell,
  ISurvivalOnlineGameInfoEvent,
  ISurvivalOnlinePlayer,
} from 'common/types/survivalOnline';
import { EGame } from 'common/types';

import Box from 'client/components/common/Box/Box';

import userAtom from 'client/atoms/userAtom';

interface ISurvivalOnlineGameProps {
  io: SocketIOClient.Socket;
}

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

function renderGrass(context: CanvasRenderingContext2D, startX: number, startY: number) {
  context.fillStyle = 'yellowgreen';
  context.fillRect(startX, startY, cellSize, cellSize);
}

function renderTree(context: CanvasRenderingContext2D, startX: number, startY: number) {
  context.fillStyle = 'green';
  context.fillRect(startX, startY, cellSize, cellSize * 0.6);

  context.fillStyle = 'brown';
  context.fillRect(startX + cellSize * 0.3, startY + cellSize * 0.6, cellSize * 0.4, cellSize * 0.4);
}

function renderPlayer(context: CanvasRenderingContext2D, startX: number, startY: number) {
  context.fillStyle = 'black';
  context.fillRect(startX, startY, cellSize, cellSize);
}

function renderBase(context: CanvasRenderingContext2D, startX: number, startY: number) {
  context.fillStyle = 'purple';
  context.fillRect(startX, startY, cellSize, cellSize);
}

function renderZombie(context: CanvasRenderingContext2D, startX: number, startY: number) {
  context.fillStyle = 'red';
  context.fillRect(startX, startY, cellSize, cellSize);
}

function renderCell(context: CanvasRenderingContext2D, startX: number, startY: number, cell: ISurvivalOnlineCell | undefined) {
  if (!cell) {
    return;
  }

  const { biome, object } = cell;

  if (biome === ESurvivalOnlineBiome.GRASS) {
    renderGrass(context, startX, startY);
  }

  const type = object?.type;

  if (!type) {
    return;
  }

  if (type === ESurvivalOnlineObject.TREE) {
    renderTree(context, startX, startY);
  } else if (type === ESurvivalOnlineObject.PLAYER) {
    renderPlayer(context, startX, startY);
  } else if (type === ESurvivalOnlineObject.BASE) {
    renderBase(context, startX, startY);
  } else if (type === ESurvivalOnlineObject.ZOMBIE) {
    renderZombie(context, startX, startY);
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

const SurvivalOnlineGame: React.FC<ISurvivalOnlineGameProps> = (props) => {
  const { io } = props;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const gameInfoRef = useRef<ISurvivalOnlineGameInfoEvent | null>(null);
  const [canvasSize, setCanvasSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  const user = useRecoilValue(userAtom);

  useEffect(() => {
    io.emit(EGameEvent.GAME_EVENT, ESurvivalOnlineGameEvent.GET_GAME_INFO);

    io.on(ESurvivalOnlineGameEvent.GAME_INFO, (gameInfo: ISurvivalOnlineGameInfoEvent) => {
      gameInfoRef.current = gameInfo;

      const context = contextRef.current;

      if (!context || !user) {
        return;
      }

      const player = gameInfo.players.find(({ login }) => login === user.login);

      if (!player) {
        return;
      }

      renderMap({ context, gameInfo, player });
    });
  }, [io, user]);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    const containerEl = containerRef.current;

    if (!canvasEl || !containerEl) {
      return;
    }

    contextRef.current = canvasEl.getContext('2d');

    const cellWidth = containerEl.offsetWidth / viewSize.width;
    const cellHeight = containerEl.offsetHeight / viewSize.height;

    const cellSize = Math.floor(Math.min(cellWidth, cellHeight));

    setCanvasSize({
      width: viewSize.width * cellSize,
      height: viewSize.height * cellSize,
    });
  }, []);

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
