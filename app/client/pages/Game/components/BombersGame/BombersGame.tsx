import React, { useEffect, useMemo, useRef, useState } from 'react';

import { CELL_SIZE } from 'client/pages/Game/components/BombersGame/constants';
import { MAP_NAMES, MAX_BOMB_COUNT, MAX_BOMB_RANGE, MAX_HP, MAX_SPEED } from 'common/constants/games/bombers';

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
import { TBomberImage } from 'client/pages/Game/components/BombersGame/types';

import getCellScreenSize from 'client/utilities/getCellScreenSize';
import renderMap from 'client/pages/Game/components/BombersGame/utilities/renderMap';
import SharedDataManager from 'common/utilities/bombers/SharedDataManager';
import { now } from 'client/utilities/time';

import Flex from 'client/components/common/Flex/Flex';
import Player from 'client/pages/Game/components/BombersGame/components/Player/Player';
import Stat from 'client/pages/Game/components/BombersGame/components/Stat/Stat';

import { IGameProps } from 'client/pages/Game/Game';
import useSocket from 'client/hooks/useSocket';
import useGlobalListener from 'client/hooks/useGlobalListener';
import useImmutableCallback from 'client/hooks/useImmutableCallback';
import useRaf from 'client/hooks/useRaf';
import useAtom from 'client/hooks/useAtom';
import useImages from 'client/hooks/useImages';

import styles from './BombersGame.pcss';

const DIRECTIONS_MAP: Partial<Record<string, EDirection>> = {
  ArrowUp: EDirection.UP,
  ArrowDown: EDirection.DOWN,
  ArrowRight: EDirection.RIGHT,
  ArrowLeft: EDirection.LEFT,
  KeyW: EDirection.UP,
  KeyS: EDirection.DOWN,
  KeyD: EDirection.RIGHT,
  KeyA: EDirection.LEFT,
};

const BombersGame: React.FC<IGameProps<EGame.BOMBERS>> = (props) => {
  const { io, gameInfo, timeDiff } = props;

  const [players, setPlayers] = useState<IPlayer[]>(gameInfo.players);
  const [canvasSize, setCanvasSize] = useState<ISize>({ width: 0, height: 0 });

  const [user] = useAtom('user');

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const mapRef = useRef<TMap>(gameInfo.map);
  const canControlRef = useRef<boolean>(gameInfo.canControl);
  const playersDataRef = useRef<IPlayerData[]>(
    players.map((player) => ({
      ...player.data,
      startMovingTimestamp: player.data.startMovingTimestamp && player.data.startMovingTimestamp - timeDiff,
    })),
  );
  const explodedDirectionsRef = useRef(new Set<IExplodedDirection>());
  const pressedDirectionsRef = useRef<EDirection[]>([]);

  const player = useMemo(() => {
    return players.find(({ login }) => login === user?.login) ?? null;
  }, [players, user]);

  const sharedDataManager = useMemo(() => {
    return new SharedDataManager({
      map: mapRef.current,
      players: playersDataRef.current,
      isPassableObject: (object) => object.type === EObject.BONUS,
    });
  }, []);

  const viewSize = useMemo<ISize>(() => {
    return {
      width: gameInfo.map[0].length,
      height: gameInfo.map.length,
    };
  }, [gameInfo.map]);

  const images = useImages<TBomberImage>({
    grass: '/bombers/grass4.png',
    wall: '/bombers/wall.png',
    box: '/bombers/box.png',
    bomb: '/bombers/bomb.png',
    bonusBomb: '/bombers/bonusBomb.png',
    bonusRange: '/bombers/bonusRange.png',
    bonusSpeed: '/bombers/bonusSpeed.png',
    bonusHp: '/bombers/bonusHp.png',
  });

  const changeCellSize = useImmutableCallback(() => {
    const containerEl = containerRef.current;

    if (!containerEl) {
      return;
    }

    const cellSize = getCellScreenSize(containerEl, viewSize, {
      width: 252,
    });

    setCanvasSize({
      width: viewSize.width * cellSize,
      height: viewSize.height * cellSize,
    });
  });

  const refreshPlayersData = useImmutableCallback(() => {
    setPlayers(
      players.map((player) => ({
        ...player,
        data: { ...playersDataRef.current[player.index] },
      })),
    );
  });

  useSocket(io, {
    [EGameServerEvent.CAN_CONTROL]: () => {
      canControlRef.current = true;
    },
    [EGameServerEvent.SYNC_COORDS]: ({ playerIndex, direction, startMovingTimestamp, coords }) => {
      const playerData = playersDataRef.current[playerIndex];

      playerData.coords = coords;
      playerData.direction = direction;
      playerData.startMovingTimestamp = startMovingTimestamp && startMovingTimestamp - timeDiff;
    },
    [EGameServerEvent.PLACE_BOMB]: ({ coords, bomb }) => {
      mapRef.current[coords.y][coords.x].objects.push(bomb);
    },
    [EGameServerEvent.BOMBS_EXPLODED]: ({ bombs, hitPlayers, explodedBoxes, invincibilityEndsAt }) => {
      invincibilityEndsAt -= timeDiff;

      bombs.forEach(({ id, coords, explodedDirections }) => {
        const explodedBombIndex = mapRef.current[coords.y][coords.x].objects.findIndex((object) => object.id === id);

        if (explodedBombIndex !== -1) {
          mapRef.current[coords.y][coords.x].objects.splice(explodedBombIndex, 1);
        }

        explodedDirectionsRef.current.add(explodedDirections[ELine.HORIZONTAL]);
        explodedDirectionsRef.current.add(explodedDirections[ELine.VERTICAL]);
      });

      hitPlayers.forEach((playerIndex) => {
        const playerData = playersDataRef.current[playerIndex];

        playerData.hp -= 1;
        playerData.invincibilityEndsAt = invincibilityEndsAt;
      });

      explodedBoxes.forEach(({ id, coords, bonuses }) => {
        const { objects } = mapRef.current[coords.y][coords.x];

        const boxIndex = objects.findIndex((object) => object.id === id);

        if (boxIndex !== -1) {
          objects.splice(boxIndex, 1);
        }

        mapRef.current[coords.y][coords.x].objects.push(...bonuses);
      });

      if (hitPlayers.length > 0) {
        refreshPlayersData();
      }

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
      const cell = mapRef.current[coords.y][coords.x];

      cell.objects.push(wall);

      cell.objects = cell.objects.filter((object) => object.type !== EObject.BONUS);

      deadPlayers.forEach((playerIndex) => {
        const playerData = playersDataRef.current[playerIndex];

        playerData.hp = 0;
        playerData.startMovingTimestamp = null;
        playerData.invincibilityEndsAt = null;
      });

      if (deadPlayers.length > 0) {
        refreshPlayersData();
      }
    },
    [EGameServerEvent.BONUS_CONSUMED]: ({ id, coords, playerIndex }) => {
      const { objects } = mapRef.current[coords.y][coords.x];
      const bonusIndex = objects.findIndex((object) => object.id === id);

      if (bonusIndex !== -1) {
        const bonus = objects.at(bonusIndex);

        if (bonus?.type === EObject.BONUS) {
          sharedDataManager.consumePlayerBonus(playerIndex, {
            type: bonus.bonusType,
          });

          objects.splice(bonusIndex, 1);
        }
      }

      if (playerIndex === player?.index) {
        refreshPlayersData();
      }
    },
    [EGameServerEvent.PLAYER_HEALED]: (playerIndex) => {
      const playerData = playersDataRef.current[playerIndex];

      playerData.hpReserve--;
      playerData.hp++;

      if (playerIndex === player?.index) {
        refreshPlayersData();
      }
    },
  });

  useGlobalListener('keydown', document, (e) => {
    if (!canControlRef.current) {
      return;
    }

    if (e.code === 'Space' || e.code === 'KeyV') {
      io.emit(EGameClientEvent.PLACE_BOMB);

      return;
    }

    const direction = DIRECTIONS_MAP[e.code];
    const pressedDirections = pressedDirectionsRef.current;

    if (direction && !pressedDirections.includes(direction)) {
      if (pressedDirections.length === 0) {
        io.emit(EGameClientEvent.START_MOVING, direction);
      }

      pressedDirections.push(direction);
    }
  });

  useGlobalListener('keyup', document, (e) => {
    if (!canControlRef.current) {
      return;
    }

    if (e.code === 'KeyH') {
      io.emit(EGameClientEvent.HEAL);

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

    if (!ctx || !images) {
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
      startsAt: gameInfo.startsAt - timeDiff,
      player,
      images,
    });
  });

  useEffect(() => {
    console.log(gameInfo);
  }, [gameInfo]);

  useEffect(() => {
    const canvasEl = canvasRef.current;

    if (!canvasEl) {
      return;
    }

    contextRef.current = canvasEl.getContext('2d');

    changeCellSize();
  }, [changeCellSize]);

  return (
    <Flex className={styles.root} justifyContent="center" alignItems="stretch" ref={containerRef}>
      <canvas
        style={{ width: canvasSize.width, height: canvasSize.height }}
        width={viewSize.width * CELL_SIZE}
        height={viewSize.height * CELL_SIZE}
        ref={canvasRef}
      />

      <Flex className={styles.rightPanel} direction="column" between={4}>
        <div>Карта: {MAP_NAMES[gameInfo.mapType]}</div>

        <Flex direction="column" between={1}>
          {players.map((player) => (
            <Player key={player.login} player={player} />
          ))}
        </Flex>

        {player && (
          <Flex direction="column" between={2}>
            <Stat label="Скорость" value={player.data.speed} maxValue={MAX_SPEED} />
            <Stat label="Количество бомб" value={player.data.maxBombCount} maxValue={MAX_BOMB_COUNT} />
            <Stat label="Радиус взрыва" value={player.data.bombRange} maxValue={MAX_BOMB_RANGE} />
            <Stat
              label={`HP${player.data.hpReserve > 0 ? ` (+${player.data.hpReserve})` : ''}`}
              value={player.data.hp}
              maxValue={MAX_HP}
            />
          </Flex>
        )}
      </Flex>
    </Flex>
  );
};

export default React.memo(BombersGame);
