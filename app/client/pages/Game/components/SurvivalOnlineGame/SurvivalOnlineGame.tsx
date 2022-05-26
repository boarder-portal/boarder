import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRecoilValue } from 'recoil';

import { CELL_SIZE, VIEW_SIZE } from 'common/constants/games/survivalOnline';

import { EDirection, EGameClientEvent, EGameServerEvent, IPlayer, TMap } from 'common/types/survivalOnline';
import { EGame } from 'common/types/game';

import renderMap from 'client/pages/Game/components/SurvivalOnlineGame/utilities/renderMap';
import getCellScreenSize from 'client/utilities/getCellScreenSize';

import Flex from 'client/components/common/Flex/Flex';

import userAtom from 'client/atoms/userAtom';
import { IGameProps } from 'client/pages/Game/Game';
import useSocket from 'client/hooks/useSocket';
import useImmutableCallback from 'client/hooks/useImmutableCallback';
import useGlobalListener from 'client/hooks/useGlobalListener';

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

  const changeCellSize = useImmutableCallback(() => {
    const containerEl = containerRef.current;

    if (!containerEl) {
      return;
    }

    const cellSize = getCellScreenSize(containerEl, VIEW_SIZE);

    setCanvasSize({
      width: VIEW_SIZE.width * cellSize,
      height: VIEW_SIZE.height * cellSize,
    });
  });

  useSocket(io, {
    [EGameServerEvent.UPDATE_GAME]: ({ players, cells }) => {
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

    if (!canvasEl) {
      return;
    }

    contextRef.current = canvasEl.getContext('2d');

    changeCellSize();
  }, [changeCellSize, io]);

  useGlobalListener('keydown', document, (e) => {
    const direction = DIRECTIONS_MAP[e.key];

    if (direction) {
      io.emit(EGameClientEvent.MOVE_PLAYER, direction);
    }
  });

  useGlobalListener('resize', window, changeCellSize);

  useEffect(() => {
    render();
  }, [player, render]);

  return (
    <Flex className={styles.root} justifyContent="center" alignItems="center" direction="column" ref={containerRef}>
      <canvas
        style={{ width: canvasSize.width, height: canvasSize.height }}
        width={VIEW_SIZE.width * CELL_SIZE}
        height={VIEW_SIZE.height * CELL_SIZE}
        ref={canvasRef}
      />
    </Flex>
  );
};

export default React.memo(SurvivalOnlineGame);
