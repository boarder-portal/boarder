import { FC, memo, useEffect, useMemo, useRef, useState } from 'react';

import { CELL_SIZE } from 'client/components/games/bombers/BombersGame/components/GameContent/constants';
import { MAP_NAMES, MAX_BOMB_COUNT, MAX_BOMB_RANGE, MAX_HP, MAX_SPEED } from 'common/constants/games/bombers';

import { BomberImage } from 'client/components/games/bombers/BombersGame/components/GameContent/types';
import { Size } from 'common/types';
import { GameType } from 'common/types/game';
import {
  BuffType,
  Direction,
  ExplodedDirection,
  GameClientEventType,
  GameServerEventType,
  Line,
  Map,
  ObjectType,
  PlayerData,
  Player as PlayerModel,
} from 'common/types/games/bombers';

import renderMap from 'client/components/games/bombers/BombersGame/components/GameContent/utilities/renderMap';
import getCellScreenSize from 'client/utilities/getCellScreenSize';
import SharedDataManager from 'common/utilities/games/bombers/SharedDataManager';

import useBoundTimestamps from 'client/components/game/Game/hooks/useBoundTimetamps';
import useCreateTimestamp from 'client/components/game/Game/hooks/useCreateTimestamp';
import useGlobalListener from 'client/hooks/useGlobalListener';
import useImages from 'client/hooks/useImages';
import useImmutableCallback from 'client/hooks/useImmutableCallback';
import usePlayer from 'client/hooks/usePlayer';
import useRaf from 'client/hooks/useRaf';
import useSocket from 'client/hooks/useSocket';

import Flex from 'client/components/common/Flex/Flex';
import { GameProps } from 'client/components/game/Game/Game';
import Player from 'client/components/games/bombers/BombersGame/components/GameContent/components/Player/Player';
import Stat from 'client/components/games/bombers/BombersGame/components/GameContent/components/Stat/Stat';

import styles from './GameContent.module.scss';

const BUFFS_MAP: Partial<Record<string, BuffType>> = {
  Digit1: BuffType.SUPER_SPEED,
  Digit2: BuffType.SUPER_BOMB,
  Digit3: BuffType.SUPER_RANGE,
  Digit4: BuffType.INVINCIBILITY,
};

const DIRECTIONS_MAP: Partial<Record<string, Direction>> = {
  ArrowUp: Direction.UP,
  ArrowDown: Direction.DOWN,
  ArrowRight: Direction.RIGHT,
  ArrowLeft: Direction.LEFT,
  KeyW: Direction.UP,
  KeyS: Direction.DOWN,
  KeyD: Direction.RIGHT,
  KeyA: Direction.LEFT,
};

const GameContent: FC<GameProps<GameType.BOMBERS>> = (props) => {
  const { io, gameInfo, gameOptions } = props;

  const createTimestamp = useCreateTimestamp();

  const [players, setPlayers] = useState<PlayerModel[]>(gameInfo.players);
  const [canvasSize, setCanvasSize] = useState<Size>({ width: 0, height: 0 });

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const mapRef = useRef<Map>(gameInfo.map);
  const canControlRef = useRef<boolean>(gameInfo.canControl);
  const playersDataRef = useRef<PlayerData[]>(
    players.map((player) => ({
      ...player.data,
      startMovingTimestamp: player.data.startMovingTimestamp && createTimestamp(player.data.startMovingTimestamp),
      buffs: player.data.buffs.map((buff) => ({
        ...buff,
        endsAt: createTimestamp(buff.endsAt),
      })),
    })),
  );
  const explodedDirectionsRef = useRef(new Set<ExplodedDirection>());
  const pressedDirectionsRef = useRef<Direction[]>([]);

  const player = usePlayer(players);
  const startsAtTimestamp = useMemo(() => {
    return createTimestamp(gameInfo.startsAt);
  }, [createTimestamp, gameInfo.startsAt]);

  const sharedDataManager = useMemo(() => {
    return new SharedDataManager({
      map: mapRef.current,
      players: playersDataRef.current,
      isPassableObject: (object) => object.type === ObjectType.BONUS,
    });
  }, []);

  const viewSize = useMemo<Size>(() => {
    return {
      width: gameInfo.map[0].length,
      height: gameInfo.map.length,
    };
  }, [gameInfo.map]);

  const images = useImages<BomberImage>({
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
    [GameServerEventType.CAN_CONTROL]: (canControl) => {
      canControlRef.current = canControl;

      console.time('time');
    },
    [GameServerEventType.SYNC_COORDS]: ({ playerIndex, direction, startMovingTimestamp, coords }) => {
      const playerData = playersDataRef.current[playerIndex];

      playerData.coords = coords;
      playerData.direction = direction;
      playerData.startMovingTimestamp = startMovingTimestamp && createTimestamp(startMovingTimestamp);
    },
    [GameServerEventType.PLACE_BOMB]: ({ coords, bomb }) => {
      mapRef.current[coords.y][coords.x].objects.push(bomb);
    },
    [GameServerEventType.BOMBS_EXPLODED]: ({ bombs, hitPlayers, explodedBoxes, destroyedWalls }) => {
      bombs.forEach(({ id, coords, explodedDirections }) => {
        sharedDataManager.removeMapObject(id, coords);

        explodedDirectionsRef.current.add(explodedDirections[Line.HORIZONTAL]);
        explodedDirectionsRef.current.add(explodedDirections[Line.VERTICAL]);
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
          explodedDirectionsRef.current.delete(explodedDirections[Line.HORIZONTAL]);
          explodedDirectionsRef.current.delete(explodedDirections[Line.VERTICAL]);
        });
      }, 250);

      let anyBoxLeft = false;

      mapRef.current.forEach((row) => {
        row.forEach((cell) => {
          if (cell.objects.some((o) => o.type === ObjectType.BOX)) {
            anyBoxLeft = true;
          }
        });
      });

      if (!anyBoxLeft) {
        console.timeEnd('time');
      }
    },
    [GameServerEventType.WALL_CREATED]: ({ coords, wall, deadPlayers }) => {
      const cell = mapRef.current[coords.y][coords.x];

      cell.objects.push(wall);

      cell.objects = cell.objects.filter((object) => object.type !== ObjectType.BONUS);

      deadPlayers.forEach((playerIndex) => {
        const playerData = playersDataRef.current[playerIndex];

        playerData.hp = 0;
        playerData.startMovingTimestamp = null;
      });

      if (deadPlayers.length > 0) {
        refreshPlayersData();
      }
    },
    [GameServerEventType.BONUS_CONSUMED]: ({ id, coords, playerIndex }) => {
      const bonus = mapRef.current[coords.y][coords.x].objects.find((object) => object.id === id);

      sharedDataManager.removeMapObject(id, coords);

      if (bonus?.type === ObjectType.BONUS) {
        sharedDataManager.consumePlayerBonus(playerIndex, {
          type: bonus.bonusType,
        });
      }

      if (playerIndex === player?.index) {
        refreshPlayersData();
      }
    },
    [GameServerEventType.PLAYER_HEALED]: (playerIndex) => {
      sharedDataManager.healPlayer(playerIndex);

      if (playerIndex === player?.index) {
        refreshPlayersData();
      }
    },
    [GameServerEventType.PLAYER_DIED]: (playerIndex) => {
      const playerData = playersDataRef.current[playerIndex];

      playerData.hp = 0;
      playerData.startMovingTimestamp = null;

      if (playerIndex === player?.index) {
        refreshPlayersData();
      }
    },
    [GameServerEventType.BUFF_ACTIVATED]: ({ playerIndex, buff }) => {
      sharedDataManager.activatePlayerBuff(playerIndex, buff.type, createTimestamp(buff.endsAt));

      if (playerIndex === player?.index) {
        refreshPlayersData();
      }
    },
    [GameServerEventType.BUFF_DEACTIVATED]: ({ playerIndex, type }) => {
      sharedDataManager.deactivatePlayerBuff(playerIndex, type);

      if (playerIndex === player?.index) {
        refreshPlayersData();
      }
    },
    [GameServerEventType.WALLS_DESTROYED]: (destroyedWalls) => {
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
      io.emit(GameClientEventType.PLACE_BOMB);

      return;
    }

    const direction = DIRECTIONS_MAP[e.code];
    const pressedDirections = pressedDirectionsRef.current;

    if (direction && !pressedDirections.includes(direction)) {
      if (pressedDirections.length === 0) {
        io.emit(GameClientEventType.START_MOVING, direction);
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
            io.emit(GameClientEventType.START_MOVING, pressedDirections[1]);
          } else {
            io.emit(GameClientEventType.STOP_MOVING);
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
      io.emit(GameClientEventType.ACTIVATE_BUFF, buff);

      return;
    }

    if (e.code === 'KeyH') {
      io.emit(GameClientEventType.HEAL);

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

export default memo(GameContent);
