import { FC, memo, useEffect, useMemo, useRef, useState } from 'react';

import { CELL_SIZE } from 'client/components/games/bombers/BombersGame/components/BombersGameContent/constants';
import { MAP_NAMES, MAX_BOMB_COUNT, MAX_BOMB_RANGE, MAX_HP, MAX_SPEED } from 'common/constants/games/bombers';

import { BomberImage } from 'client/components/games/bombers/BombersGame/components/BombersGameContent/types';
import { Size } from 'common/types';
import { GameType } from 'common/types/game';
import {
  BaseBuff,
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

import renderMap from 'client/components/games/bombers/BombersGame/components/BombersGameContent/utilities/renderMap';
import getCellScreenSize from 'client/utilities/getCellScreenSize';
import Timestamp from 'common/utilities/Timestamp';
import SharedDataManager from 'common/utilities/games/bombers/SharedDataManager';

import useBoundTimestamps from 'client/components/game/Game/hooks/useBoundTimetamps';
import useCreateTimestamp from 'client/components/game/Game/hooks/useCreateTimestamp';
import useGameImages from 'client/hooks/useGameImages';
import useGlobalListener from 'client/hooks/useGlobalListener';
import useImmutableCallback from 'client/hooks/useImmutableCallback';
import usePlayer from 'client/hooks/usePlayer';
import useRaf from 'client/hooks/useRaf';
import useSocket from 'client/hooks/useSocket';

import Flex from 'client/components/common/Flex/Flex';
import { GameContentProps } from 'client/components/game/Game/Game';
import GameContent from 'client/components/game/GameContent/GameContent';
import Player from 'client/components/games/bombers/BombersGame/components/BombersGameContent/components/Player/Player';
import Stat from 'client/components/games/bombers/BombersGame/components/BombersGameContent/components/Stat/Stat';

import styles from './BombersGameContent.module.scss';

export type ClientPlayerData = Omit<PlayerData, 'startMovingTimestamp' | 'buffs'> & {
  startMovingTimestamp: Timestamp | null;
  buffs: Set<
    BaseBuff & {
      endsAt: Timestamp;
    }
  >;
};

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

const BombersGameContent: FC<GameContentProps<GameType.BOMBERS>> = (props) => {
  const { io, gameInfo, gameOptions } = props;

  const createTimestamp = useCreateTimestamp();

  const [players, setPlayers] = useState<PlayerModel[]>(gameInfo.players);
  const [canvasSize, setCanvasSize] = useState<Size>({ width: 0, height: 0 });

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const mapRef = useRef<Map>(gameInfo.map);
  const canControlRef = useRef<boolean>(gameInfo.canControl);
  const playersDataRef = useRef<ClientPlayerData[]>(
    players.map((player) => ({
      ...player.data,
      startMovingTimestamp: player.data.startMovingTimestamp && createTimestamp(player.data.startMovingTimestamp),
      buffs: new Set(
        player.data.buffs.map((buff) => ({
          ...buff,
          endsAt: createTimestamp(buff.endsAt),
        })),
      ),
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
      buffCosts: gameInfo.buffCosts,
      isPassableObject: (object) => object.type === ObjectType.BONUS,
      deactivatePlayerBuff: (buff, playerIndex) => {
        playersDataRef.current[playerIndex].buffs.delete(buff);
      },
    });
  }, [gameInfo.buffCosts]);

  const viewSize = useMemo<Size>(() => {
    return {
      width: gameInfo.map[0].length,
      height: gameInfo.map.length,
    };
  }, [gameInfo.map]);

  const images = useGameImages<BomberImage>({
    game: GameType.BOMBERS,
    sources: {
      grass: '/grass.jpg',
      wall: '/wall.png',
      box: '/box.png',
      bomb: '/bomb.png',
      bonusBomb: '/bonusBomb.png',
      bonusRange: '/bonusRange.png',
      bonusSpeed: '/bonusSpeed.png',
      bonusHp: '/bonusHp.png',
    },
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

  const refreshPlayersProperties = useImmutableCallback(() => {
    setPlayers(
      players.map((player) => ({
        ...player,
        data: {
          ...player.data,
          properties: playersDataRef.current[player.index].properties,
        },
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

        playerData.properties.hp -= damage;
      });

      explodedBoxes.forEach(({ id, coords, bonuses }) => {
        sharedDataManager.removeMapObject(id, coords);

        mapRef.current[coords.y][coords.x].objects.push(...bonuses);
      });

      destroyedWalls.forEach(({ id, coords }) => {
        sharedDataManager.removeMapObject(id, coords);
      });

      if (hitPlayers.length > 0) {
        refreshPlayersProperties();
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

        playerData.properties.hp = 0;
        playerData.startMovingTimestamp = null;
      });

      if (deadPlayers.length > 0) {
        refreshPlayersProperties();
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
        refreshPlayersProperties();
      }
    },
    [GameServerEventType.PLAYER_HEALED]: (playerIndex) => {
      sharedDataManager.healPlayer(playerIndex);

      if (playerIndex === player?.index) {
        refreshPlayersProperties();
      }
    },
    [GameServerEventType.PLAYER_DIED]: (playerIndex) => {
      const playerData = playersDataRef.current[playerIndex];

      playerData.properties.hp = 0;
      playerData.startMovingTimestamp = null;

      if (playerIndex === player?.index) {
        refreshPlayersProperties();
      }
    },
    [GameServerEventType.BUFF_ACTIVATED]: ({ playerIndex, buff }) => {
      const endsAt = createTimestamp(buff.endsAt);
      const oldBuff = sharedDataManager.activatePlayerBuff(playerIndex, buff.type);

      if (oldBuff) {
        oldBuff.endsAt = createTimestamp(buff.endsAt);
      } else {
        playersDataRef.current[playerIndex].buffs.add({
          type: buff.type,
          endsAt,
        });
      }

      if (playerIndex === player?.index) {
        refreshPlayersProperties();
      }
    },
    [GameServerEventType.BUFF_DEACTIVATED]: ({ playerIndex, type }) => {
      sharedDataManager.deactivatePlayerBuff(playerIndex, type);

      if (playerIndex === player?.index) {
        refreshPlayersProperties();
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
      ...[...buffs].map(({ endsAt }) => endsAt),
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
        playerData.properties.hp === 0 ||
        playerData.startMovingTimestamp.pausedAt !== null
      ) {
        return;
      }

      const newMoveTimestamp = createTimestamp();

      sharedDataManager.movePlayer(playerIndex);

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
    <GameContent game={GameType.BOMBERS} fullscreenOrientation="landscape">
      <Flex className={styles.root} between={4} justifyContent="center" alignItems="stretch" ref={containerRef}>
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
              <Stat
                label="Скорость"
                value={player.data.properties.speed}
                maxValue={MAX_SPEED}
                overflow={player.data.properties.speedReserve}
              />
              <Stat
                label="Количество бомб"
                value={player.data.properties.maxBombCount}
                maxValue={MAX_BOMB_COUNT}
                overflow={player.data.properties.maxBombCountReserve}
              />
              <Stat
                label="Радиус взрыва"
                value={player.data.properties.bombRange}
                maxValue={MAX_BOMB_RANGE}
                overflow={player.data.properties.bombRangeReserve}
              />
              <Stat
                label="HP"
                value={player.data.properties.hp}
                maxValue={MAX_HP}
                overflow={player.data.properties.hpReserve}
              />
            </Flex>
          )}
        </Flex>
      </Flex>
    </GameContent>
  );
};

export default memo(BombersGameContent);
