import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import block from 'bem-cn';
import { useRecoilValue } from 'recoil';

import { CELL_SIZE, VIEW_SIZE } from 'common/constants/games/survivalOnline';

import {
  EDirection,
  EGameEvent,
  IGameInfoEvent,
  IPlayer,
  IUpdateGameEvent,
} from 'common/types/survivalOnline';

import renderMap from 'client/pages/Game/components/SurvivalOnlineGame/utilities/renderMap';
import getCellScreenSize from 'client/pages/Game/components/SurvivalOnlineGame/utilities/getCellScreenSize';

import Box from 'client/components/common/Box/Box';

import userAtom from 'client/atoms/userAtom';

interface ISurvivalOnlineGameProps {
  io: SocketIOClient.Socket;
  players: IPlayer[];
  isGameEnd: boolean;
}

const MOVES_KEY_CODES = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'];

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
  const gameInfoRef = useRef<IGameInfoEvent | null>(null);
  const playerRef = useRef<IPlayer | null>(null);
  const [canvasSize, setCanvasSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  const user = useRecoilValue(userAtom);

  useEffect(() => {
    io.emit(EGameEvent.GET_GAME_INFO);

    io.on(EGameEvent.GAME_INFO, (gameInfo: IGameInfoEvent) => {
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

    io.on(EGameEvent.UPDATE_GAME, ({ players, cells }: IUpdateGameEvent) => {
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

    return () => {
      io.off(EGameEvent.GAME_INFO);
      io.off(EGameEvent.UPDATE_GAME);
    };
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
      width: VIEW_SIZE.width * cellSize,
      height: VIEW_SIZE.height * cellSize,
    });

    document.addEventListener('keydown', (e) => {
      if (MOVES_KEY_CODES.includes(e.key)) {
        io.emit(
          EGameEvent.MOVE_PLAYER,
          e.key === 'ArrowUp' ?
            EDirection.UP :
            e.key === 'ArrowRight' ?
              EDirection.RIGHT :
              e.key === 'ArrowDown' ?
                EDirection.DOWN :
                EDirection.LEFT,
        );
      }
    });

    window.addEventListener('resize', () => {
      const cellSize = getCellScreenSize(containerEl);

      setCanvasSize({
        width: VIEW_SIZE.width * cellSize,
        height: VIEW_SIZE.height * cellSize,
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
        width={VIEW_SIZE.width * CELL_SIZE}
        height={VIEW_SIZE.height * CELL_SIZE}
        ref={canvasRef}
      />
    </Root>
  );
};

export default React.memo(SurvivalOnlineGame);
