import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import block from 'bem-cn';
import { useRecoilValue } from 'recoil';

import { GAMES_CONFIG } from 'common/constants/gamesConfig';

import { EGameEvent } from 'common/types/game';
import {
  ESurvivalOnlineDirection,
  ESurvivalOnlineGameEvent,
  ISurvivalOnlineCell,
  ISurvivalOnlineGameInfoEvent,
  ISurvivalOnlinePlayer,
} from 'common/types/survivalOnline';
import { EGame } from 'common/types';

import renderMap from 'client/pages/Game/components/SurvivalOnlineGame/utilities/renderMap';
import getCellScreenSize from 'client/pages/Game/components/SurvivalOnlineGame/utilities/getCellScreenSize';

import Box from 'client/components/common/Box/Box';

import userAtom from 'client/atoms/userAtom';

interface ISurvivalOnlineGameProps {
  io: SocketIOClient.Socket;
  players: ISurvivalOnlinePlayer[];
  isGameEnd: boolean;
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
`;

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
    io.emit(ESurvivalOnlineGameEvent.GET_GAME_INFO);

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
