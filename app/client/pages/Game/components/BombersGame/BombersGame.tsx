import React, { useEffect, useRef, useState } from 'react';

import { CELL_SIZE } from 'client/pages/Game/components/BombersGame/constants';

import { EGame } from 'common/types/game';
import { EDirection, EGameClientEvent, IPlayer, TMap } from 'common/types/bombers';
import { ISize } from 'common/types';

import getCellScreenSize from 'client/utilities/getCellScreenSize';
import renderMap from 'client/pages/Game/components/BombersGame/utilities/renderMap';

import Flex from 'client/components/common/Flex/Flex';

import { IGameProps } from 'client/pages/Game/Game';
import useSocket from 'client/hooks/useSocket';
import useGlobalListener from 'client/hooks/useGlobalListener';
import useImmutableCallback from 'client/hooks/useImmutableCallback';
import useRaf from 'client/hooks/useRaf';

import styles from './BombersGame.pcss';

const DIRECTIONS_MAP: Partial<Record<string, EDirection>> = {
  ArrowUp: EDirection.UP,
  ArrowDown: EDirection.DOWN,
  ArrowRight: EDirection.RIGHT,
  ArrowLeft: EDirection.LEFT,
};

const BombersGame: React.FC<IGameProps<EGame.BOMBERS>> = (props) => {
  const { io, gameInfo } = props;

  const [players] = useState<IPlayer[]>(gameInfo.players);
  const [canvasSize, setCanvasSize] = useState<ISize>({ width: 0, height: 0 });

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const mapRef = useRef<TMap>(gameInfo.map);
  const pressedDirectionsRef = useRef<EDirection[]>([]);

  const viewSize: ISize = {
    width: gameInfo.map[0].length,
    height: gameInfo.map.length,
  };

  const changeCellSize = useImmutableCallback(() => {
    const containerEl = containerRef.current;

    if (!containerEl) {
      return;
    }

    const cellSize = getCellScreenSize(containerEl, viewSize);

    setCanvasSize({
      width: viewSize.width * cellSize,
      height: viewSize.height * cellSize,
    });
  });

  useSocket(io, {});

  useGlobalListener('keydown', document, (e) => {
    const direction = DIRECTIONS_MAP[e.key];
    const pressedDirections = pressedDirectionsRef.current;

    if (direction && !pressedDirections.includes(direction)) {
      if (pressedDirections.length === 0) {
        io.emit(EGameClientEvent.START_MOVING, direction);
      }

      pressedDirections.push(direction);
    }
  });

  useGlobalListener('keyup', document, (e) => {
    if (e.code === 'Space') {
      io.emit(EGameClientEvent.PLACE_BOMB);

      return;
    }

    const direction = DIRECTIONS_MAP[e.code];
    const pressedDirections = pressedDirectionsRef.current;

    if (direction) {
      const directionIndex = pressedDirections.indexOf(direction);

      if (directionIndex !== -1) {
        if (directionIndex === 0) {
          if (pressedDirections.length > 1) {
            io.emit(EGameClientEvent.START_MOVING, pressedDirections[1]);
          } else {
            io.emit(EGameClientEvent.STOP_MOVING);
          }
        }

        pressedDirections.splice(directionIndex, 1);
      }
    }
  });

  useGlobalListener('resize', window, changeCellSize);

  useRaf(() => {
    const ctx = contextRef.current;

    if (!ctx) {
      return;
    }

    // TODO: move players

    renderMap({ ctx, map: mapRef.current, players });
  });

  useEffect(() => {
    console.log(gameInfo);

    const canvasEl = canvasRef.current;

    if (!canvasEl) {
      return;
    }

    contextRef.current = canvasEl.getContext('2d');

    changeCellSize();
  }, [changeCellSize, gameInfo]);

  return (
    <Flex className={styles.root} justifyContent="center" alignItems="center" direction="column" ref={containerRef}>
      <canvas
        style={{ width: canvasSize.width, height: canvasSize.height }}
        width={viewSize.width * CELL_SIZE}
        height={viewSize.height * CELL_SIZE}
        ref={canvasRef}
      />
    </Flex>
  );
};

export default React.memo(BombersGame);
