import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRecoilValue } from 'recoil';

import { CELL_SIZE, VIEW_SIZE } from 'common/constants/games/survivalOnline';

import { EDirection, EGameEvent, IPlayer, TMap } from 'common/types/survivalOnline';
import { EGame } from 'common/types/game';

import renderMap from 'client/pages/Game/components/SurvivalOnlineGame/utilities/renderMap';
import getCellScreenSize from 'client/pages/Game/components/SurvivalOnlineGame/utilities/getCellScreenSize';

import Box from 'client/components/common/Box/Box';

import userAtom from 'client/atoms/userAtom';
import { IGameProps } from 'client/pages/Game/Game';
import useSocket from 'client/hooks/useSocket';
import useImmutableCallback from 'client/hooks/useImmutableCallback';

import styles from './SurvivalOnlineGame.pcss';

const DIRECTIONS_MAP: Partial<Record<string, EDirection>> = {
  ArrowUp: EDirection.UP,
  ArrowDown: EDirection.DOWN,
  ArrowRight: EDirection.RIGHT,
  ArrowLeft: EDirection.LEFT,
};

const SurvivalOnlineGame: React.FC<IGameProps<EGame.SURVIVAL_ONLINE>> = (props) => {
  const { io, gameInfo } = props;

  const [players, setPlayers] = useState<IPlayer[]>(gameInfo.players);
  const [canvasSize, setCanvasSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const mapRef = useRef<TMap>(gameInfo.map);

  const user = useRecoilValue(userAtom);

  const player = useMemo(() => {
    return players.find(({ login }) => user?.login === login) ?? null;
  }, [players, user]);

  const render = useImmutableCallback(() => {
    const context = contextRef.current;

    if (context && player) {
      renderMap({ context, map: mapRef.current, player });
    }
  });

  useSocket(io, {
    [EGameEvent.UPDATE_GAME]: ({ players, cells }) => {
      console.log('UPDATE_GAME', { players, cells });

      cells.forEach((cell) => {
        mapRef.current[cell.y][cell.x] = cell;
      });

      if (players) {
        setPlayers(players);
      } else {
        render();
      }
    },
  });

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
      const direction = DIRECTIONS_MAP[e.key];

      if (direction) {
        io.emit(EGameEvent.MOVE_PLAYER, direction);
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

  useEffect(() => {
    render();
  }, [player, render]);

  return (
    <Box className={styles.root} flex justifyContent="center" alignItems="center" column innerRef={containerRef}>
      <canvas
        style={{ width: canvasSize.width, height: canvasSize.height }}
        width={VIEW_SIZE.width * CELL_SIZE}
        height={VIEW_SIZE.height * CELL_SIZE}
        ref={canvasRef}
      />
    </Box>
  );
};

export default React.memo(SurvivalOnlineGame);
