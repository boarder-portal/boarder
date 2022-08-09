import React, { useEffect, useMemo, useRef, useState } from 'react';

import { CELL_SIZE } from 'client/pages/Game/components/BombersGame/constants';
import { MAP_NAMES, MAX_BOMB_COUNT, MAX_BOMB_RANGE, MAX_HP, MAX_SPEED } from 'common/constants/games/bombers';

import { EGame } from 'common/types/game';
import {
  EBuff,
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

import useSocket from 'client/hooks/useSocket';
import useGlobalListener from 'client/hooks/useGlobalListener';
import useImmutableCallback from 'client/hooks/useImmutableCallback';
import useRaf from 'client/hooks/useRaf';
import usePlayer from 'client/hooks/usePlayer';
import useImages from 'client/hooks/useImages';
import useCreateTimestamp from 'client/pages/Game/hooks/useCreateTimestamp';
import useBoundTimestamps from 'client/pages/Game/hooks/useBoundTimetamps';

import Stat from 'client/pages/Game/components/BombersGame/components/Stat/Stat';
import Player from 'client/pages/Game/components/BombersGame/components/Player/Player';
import Flex from 'client/components/common/Flex/Flex';

import { IGameProps } from 'client/pages/Game/Game';

import styles from './BombersGame.pcss';

const BUFFS_MAP: Partial<Record<string, EBuff>> = {
  Digit1: EBuff.SUPER_SPEED,
  Digit2: EBuff.SUPER_BOMB,
  Digit3: EBuff.SUPER_RANGE,
  Digit4: EBuff.INVINCIBILITY,
};

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
  const { io, gameInfo, gameOptions } = props;

  const createTimestamp = useCreateTimestamp();

  const [players, setPlayers] = useState<IPlayer[]>(gameInfo.players);
  const [canvasSize, setCanvasSize] = useState<ISize>({ width: 0, height: 0 });

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const mapRef = useRef<TMap>(gameInfo.map);
  const canControlRef = useRef<boolean>(gameInfo.canControl);
  const playersDataRef = useRef<IPlayerData[]>(
    players.map((player) => ({
      ...player.data,
      startMovingTimestamp: player.data.startMovingTimestamp && createTimestamp(player.data.startMovingTimestamp),
      buffs: player.data.buffs.map((buff) => ({
        ...buff,
        endsAt: createTimestamp(buff.endsAt),
      })),
    })),
  );
  const explodedDirectionsRef = useRef(new Set<IExplodedDirection>());
  const pressedDirectionsRef = useRef<EDirection[]>([]);

  const player = usePlayer(players);
  const startsAtTimestamp = useMemo(() => {
    return createTimestamp(gameInfo.startsAt);
  }, [createTimestamp, gameInfo.startsAt]);

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
    grass: '/bombers/grass.jpg',
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
      width: 276,
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
    [EGameServerEvent.CAN_CONTROL]: (canControl) => {
      canControlRef.current = canControl;
    },
    [EGameServerEvent.SYNC_COORDS]: ({ playerIndex, direction, startMovingTimestamp, coords }) => {
      const playerData = playersDataRef.current[playerIndex];

      playerData.coords = coords;
      playerData.direction = direction;
      playerData.startMovingTimestamp = startMovingTimestamp && createTimestamp(startMovingTimestamp);
    },
    [EGameServerEvent.PLACE_BOMB]: ({ coords, bomb }) => {
      mapRef.current[coords.y][coords.x].objects.push(bomb);
    },
    [EGameServerEvent.BOMBS_EXPLODED]: ({ bombs, hitPlayers, explodedBoxes, destroyedWalls }) => {
      bombs.forEach(({ id, coords, explodedDirections }) => {
        sharedDataManager.removeMapObject(id, coords);

        explodedDirectionsRef.current.add(explodedDirections[ELine.HORIZONTAL]);
        explodedDirectionsRef.current.add(explodedDirections[ELine.VERTICAL]);
      });

      hitPlayers.forEach(({ index, damage }) => {
        const playerData = playersDataRef.current[index];

        playerData.hp -= damage;
      });

      explodedBoxes.forEach(({ id, coords, bonuses }) => {
        sharedDataManager.removeMapObject(id, coords);

        mapRef.current[coords.y][coords.x].objects.push(...bonuses);
      });

      destroyedWalls.forEach(({ id, coords }) => {
        sharedDataManager.removeMapObject(id, coords);
      });

      if (hitPlayers.length > 0) {
        refreshPlayersData();
      }

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
      });

      if (deadPlayers.length > 0) {
        refreshPlayersData();
      }
    },
    [EGameServerEvent.BONUS_CONSUMED]: ({ id, coords, playerIndex }) => {
      const bonus = mapRef.current[coords.y][coords.x].objects.find((object) => object.id === id);

      sharedDataManager.removeMapObject(id, coords);

      if (bonus?.type === EObject.BONUS) {
        sharedDataManager.consumePlayerBonus(playerIndex, {
          type: bonus.bonusType,
        });
      }

      if (playerIndex === player?.index) {
        refreshPlayersData();
      }
    },
    [EGameServerEvent.PLAYER_HEALED]: (playerIndex) => {
      sharedDataManager.healPlayer(playerIndex);

      if (playerIndex === player?.index) {
        refreshPlayersData();
      }
    },
    [EGameServerEvent.PLAYER_DIED]: (playerIndex) => {
      const playerData = playersDataRef.current[playerIndex];

      playerData.hp = 0;
      playerData.startMovingTimestamp = null;

      if (playerIndex === player?.index) {
        refreshPlayersData();
      }
    },
    [EGameServerEvent.BUFF_ACTIVATED]: ({ playerIndex, buff }) => {
      sharedDataManager.activatePlayerBuff(playerIndex, buff.type, createTimestamp(buff.endsAt));

      if (playerIndex === player?.index) {
        refreshPlayersData();
      }
    },
    [EGameServerEvent.BUFF_DEACTIVATED]: ({ playerIndex, type }) => {
      sharedDataManager.deactivatePlayerBuff(playerIndex, type);

      if (playerIndex === player?.index) {
        refreshPlayersData();
      }
    },
    [EGameServerEvent.WALLS_DESTROYED]: (destroyedWalls) => {
      destroyedWalls.forEach(({ id, coords }) => {
        sharedDataManager.removeMapObject(id, coords);
      });
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
    const direction = DIRECTIONS_MAP[e.code];
    const pressedDirections = pressedDirectionsRef.current;

    if (direction) {
      const directionIndex = pressedDirections.indexOf(direction);

      if (directionIndex !== -1) {
        if (directionIndex === 0 && canControlRef.current) {
          if (pressedDirections.length > 1) {
            io.emit(EGameClientEvent.START_MOVING, pressedDirections[1]);
          } else {
            io.emit(EGameClientEvent.STOP_MOVING);
          }
        }

        pressedDirections.splice(directionIndex, 1);
      }

      return;
    }

    if (!canControlRef.current) {
      return;
    }

    const buff = BUFFS_MAP[e.code];

    if (gameOptions.withAbilities && buff) {
      io.emit(EGameClientEvent.ACTIVATE_BUFF, buff);

      return;
    }

    if (e.code === 'KeyH') {
      io.emit(EGameClientEvent.HEAL);

      return;
    }
  });

  useGlobalListener('resize', window, changeCellSize);

  useBoundTimestamps(() => [
    startsAtTimestamp,
    ...playersDataRef.current.flatMap(({ buffs, startMovingTimestamp }) => [
      startMovingTimestamp,
      ...buffs.map(({ endsAt }) => endsAt),
    ]),
  ]);

  useRaf(() => {
    const ctx = contextRef.current;

    if (!ctx || !images) {
      return;
    }

    playersDataRef.current.forEach((playerData, playerIndex) => {
      if (
        !playerData.startMovingTimestamp ||
        playerData.hp === 0 ||
        playerData.startMovingTimestamp.pausedAt !== null
      ) {
        return;
      }

      const newMoveTimestamp = createTimestamp();

      sharedDataManager.movePlayer(playerIndex, playerData.startMovingTimestamp.timePassed);

      playerData.startMovingTimestamp = newMoveTimestamp;
    });

    renderMap({
      ctx,
      map: mapRef.current,
      playersData: playersDataRef.current,
      explodedDirections: explodedDirectionsRef.current,
      startsAt: startsAtTimestamp,
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
            <Stat label="Скорость" value={player.data.speed} maxValue={MAX_SPEED} overflow={player.data.speedReserve} />
            <Stat
              label="Количество бомб"
              value={player.data.maxBombCount}
              maxValue={MAX_BOMB_COUNT}
              overflow={player.data.maxBombCountReserve}
            />
            <Stat
              label="Радиус взрыва"
              value={player.data.bombRange}
              maxValue={MAX_BOMB_RANGE}
              overflow={player.data.bombRangeReserve}
            />
            <Stat label="HP" value={player.data.hp} maxValue={MAX_HP} overflow={player.data.hpReserve} />
          </Flex>
        )}
      </Flex>
    </Flex>
  );
};

export default React.memo(BombersGame);
