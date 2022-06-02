import React, { useEffect, useMemo, useRef, useState } from 'react';

import { CELL_SIZE } from 'client/pages/Game/components/BombersGame/constants';

import { EGame } from 'common/types/game';
import {
  EDirection,
  EGameClientEvent,
  EGameServerEvent,
  ELine,
  EObject,
  IExplodedDirection,
  IPlayer,
  IPlayerData,
  TMap,
} from 'common/types/bombers';
import { ISize } from 'common/types';

import getCellScreenSize from 'client/utilities/getCellScreenSize';
import renderMap from 'client/pages/Game/components/BombersGame/utilities/renderMap';
import SharedDataManager from 'common/utilities/bombers/SharedDataManager';
import { now } from 'client/utilities/time';

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
  const { io, gameInfo, timeDiff } = props;

  const [players] = useState<IPlayer[]>(gameInfo.players);
  const [canvasSize, setCanvasSize] = useState<ISize>({ width: 0, height: 0 });

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const mapRef = useRef<TMap>(gameInfo.map);
  const playersDataRef = useRef<IPlayerData[]>(
    players.map((player) => ({
      ...player.data,
      startMovingTimestamp: player.data.startMovingTimestamp && player.data.startMovingTimestamp - timeDiff,
    })),
  );
  const explodedDirectionsRef = useRef(new Set<IExplodedDirection>());
  const pressedDirectionsRef = useRef<EDirection[]>([]);

  const sharedDataManager = useMemo(() => {
    return new SharedDataManager({
      map: mapRef.current,
      players: playersDataRef.current,
      isPassableObject: (object) => object === null || object?.type === EObject.BONUS,
    });
  }, []);

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

  useSocket(io, {
    [EGameServerEvent.START_MOVING]: ({ playerIndex, direction, startMovingTimestamp, coords }) => {
      const playerData = playersDataRef.current[playerIndex];

      playerData.coords = coords;
      playerData.direction = direction;
      playerData.startMovingTimestamp = startMovingTimestamp - timeDiff;
    },
    [EGameServerEvent.STOP_MOVING]: ({ playerIndex, coords }) => {
      playersDataRef.current[playerIndex].coords = coords;
      playersDataRef.current[playerIndex].startMovingTimestamp = null;
    },
    [EGameServerEvent.PLACE_BOMB]: ({ coords, bomb }) => {
      mapRef.current[coords.y][coords.x].object = bomb;
    },
    [EGameServerEvent.BOMBS_EXPLODED]: ({ bombs, hitPlayers, explodedBoxes, invincibilityEndsAt }) => {
      invincibilityEndsAt -= timeDiff;

      bombs.forEach(({ coords, explodedDirections }) => {
        mapRef.current[coords.y][coords.x].object = null;

        explodedDirectionsRef.current.add(explodedDirections[ELine.HORIZONTAL]);
        explodedDirectionsRef.current.add(explodedDirections[ELine.VERTICAL]);
      });

      hitPlayers.forEach((playerIndex) => {
        const playerData = playersDataRef.current[playerIndex];

        playerData.hp -= 1;
        playerData.invincibilityEndsAt = invincibilityEndsAt;
      });

      explodedBoxes.forEach(({ coords, bonus }) => {
        mapRef.current[coords.y][coords.x].object = bonus;
      });

      setTimeout(() => {
        hitPlayers.forEach((playerIndex) => {
          playersDataRef.current[playerIndex].invincibilityEndsAt = null;
        });
      }, invincibilityEndsAt);

      setTimeout(() => {
        bombs.forEach(({ explodedDirections }) => {
          explodedDirectionsRef.current.delete(explodedDirections[ELine.HORIZONTAL]);
          explodedDirectionsRef.current.delete(explodedDirections[ELine.VERTICAL]);
        });
      }, 250);
    },
    [EGameServerEvent.WALL_CREATED]: ({ coords, wall, deadPlayers }) => {
      mapRef.current[coords.y][coords.x].object = wall;

      deadPlayers.forEach((playerIndex) => {
        const playerData = playersDataRef.current[playerIndex];

        playerData.hp = 0;
        playerData.startMovingTimestamp = null;
        playerData.invincibilityEndsAt = null;
      });
    },
    [EGameServerEvent.BONUS_CONSUMED]: ({ coords, playerIndex }) => {
      const cell = mapRef.current[coords.y][coords.x];

      if (cell.object?.type === EObject.BONUS) {
        sharedDataManager.consumePlayerBonus(playerIndex, {
          type: cell.object.bonusType,
        });

        cell.object = null;
      }
    },
  });

  useGlobalListener('keydown', document, (e) => {
    if (e.code === 'Space' || e.key === 'v') {
      io.emit(EGameClientEvent.PLACE_BOMB);

      return;
    }

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

    playersDataRef.current.forEach((playerData, playerIndex) => {
      if (!playerData.startMovingTimestamp || playerData.hp === 0) {
        return;
      }

      const newMoveTimestamp = now();
      const timePassed = newMoveTimestamp - playerData.startMovingTimestamp;

      sharedDataManager.movePlayer(playerIndex, timePassed);

      playerData.startMovingTimestamp = newMoveTimestamp;
    });

    renderMap({
      ctx,
      map: mapRef.current,
      playersData: playersDataRef.current,
      explodedDirections: explodedDirectionsRef.current,
    });
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
