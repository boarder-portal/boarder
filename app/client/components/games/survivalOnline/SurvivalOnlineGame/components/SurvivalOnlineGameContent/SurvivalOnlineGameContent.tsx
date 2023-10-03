import { FC, memo, useEffect, useRef, useState } from 'react';

import { CELL_SIZE, VIEW_SIZE } from 'common/constants/games/survivalOnline';

import { GameType } from 'common/types/game';
import { Direction, GameClientEventType, GameServerEventType, Map, Player } from 'common/types/games/survivalOnline';

import renderMap from 'client/components/games/survivalOnline/SurvivalOnlineGame/components/SurvivalOnlineGameContent/utilities/renderMap';
import getCellScreenSize from 'client/utilities/getCellScreenSize';

import useGlobalListener from 'client/hooks/useGlobalListener';
import useImmutableCallback from 'client/hooks/useImmutableCallback';
import usePlayer from 'client/hooks/usePlayer';
import useSocket from 'client/hooks/useSocket';

import Flex from 'client/components/common/Flex/Flex';
import { GameContentProps } from 'client/components/game/Game/Game';
import GameContent from 'client/components/game/GameContent/GameContent';

import styles from './SurvivalOnlineGameContent.module.scss';

const DIRECTIONS_MAP: Partial<Record<string, Direction>> = {
  ArrowUp: Direction.UP,
  ArrowDown: Direction.DOWN,
  ArrowRight: Direction.RIGHT,
  ArrowLeft: Direction.LEFT,
};

const SurvivalOnlineGameContent: FC<GameContentProps<GameType.SURVIVAL_ONLINE>> = (props) => {
  const { io, gameInfo } = props;

  const [players, setPlayers] = useState<Player[]>(gameInfo.players);
  const [canvasSize, setCanvasSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const mapRef = useRef<Map>(gameInfo.map);

  const player = usePlayer(players);

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
    [GameServerEventType.UPDATE_GAME]: ({ players, cells }) => {
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
      io.emit(GameClientEventType.MOVE_PLAYER, direction);
    }
  });

  useGlobalListener('resize', window, changeCellSize);

  useEffect(() => {
    render();
  }, [player, render]);

  return (
    <GameContent game={GameType.SURVIVAL_ONLINE} fullscreenOrientation="landscape">
      <Flex className={styles.root} justifyContent="center" alignItems="center" direction="column" ref={containerRef}>
        <canvas
          style={{ width: canvasSize.width, height: canvasSize.height }}
          width={VIEW_SIZE.width * CELL_SIZE}
          height={VIEW_SIZE.height * CELL_SIZE}
          ref={canvasRef}
        />
      </Flex>
    </GameContent>
  );
};

export default memo(SurvivalOnlineGameContent);
