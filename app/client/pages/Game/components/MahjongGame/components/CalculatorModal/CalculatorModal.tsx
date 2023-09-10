import { FC, memo, useCallback, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import { unstable_batchedUpdates as batchedUpdates } from 'react-dom';

import { STANDARD_TILES } from 'common/constants/games/mahjong/tiles';
import { ALL_WINDS } from 'common/constants/games/mahjong';

import {
  ESet,
  ESetConcealedType,
  EWind,
  IHandMahjong,
  IPlayer,
  TDeclaredSet,
  TPlayableTile,
  TTile,
} from 'common/types/mahjong';

import {
  chow,
  getLastTileCandidatesFromTiles,
  getSupposedHandTileCount,
  getTileCount,
  isEqualTiles,
  isSuited,
  kong,
  pung,
  tilesContainTile,
} from 'common/utilities/mahjong/tiles';
import { isDeclaredMeldedSet, isKong, isMelded } from 'common/utilities/mahjong/sets';
import { getAllWaits, getHandMahjong, IHandScoreOptions } from 'common/utilities/mahjong/scoring';
import { getWindHumanName } from 'common/utilities/mahjong/stringify';
import { getTileHeight } from 'client/pages/Game/components/MahjongGame/utilities/tile';

import { usePrevious } from 'client/hooks/usePrevious';
import useImmutableCallback from 'client/hooks/useImmutableCallback';

import Modal from 'client/components/common/Modal/Modal';
import Tile from 'client/pages/Game/components/MahjongGame/components/Tile/Tile';
import Flex from 'client/components/common/Flex/Flex';
import RadioGroup, { ISelectOption } from 'client/components/common/RadioGroup/RadioGroup';
import Tiles, { EOpenType } from 'client/pages/Game/components/MahjongGame/components/Tiles/Tiles';
import Checkbox from 'client/components/common/Checkbox/Checkbox';
import Button from 'client/components/common/Button/Button';
import Mahjong from 'client/pages/Game/components/MahjongGame/components/Mahjong/Mahjong';
import Select from 'client/components/common/Select/Select';

import styles from './CalculatorModal.module.scss';

enum ESelectMode {
  CHOW = 'CHOW',
  PUNG = 'PUNG',
  MELDED_KONG = 'MELDED_KONG',
  CONCEALED_KONG = 'CONCEALED_KONG',
  HAND = 'HAND',
  WINNING_TILE = 'WINNING_TILE',
}

interface ICalculatorModalProps {
  open: boolean;
  declaredSets: TDeclaredSet[];
  hand: TTile[];
  winningTile: TTile | null;
  roundWind: EWind | null;
  isRobbingKong: boolean;
  isReplacementTile: boolean;
  isLastWallTile: boolean;
  activePlayerIndex: number;
  player: IPlayer | null;
  players: IPlayer[];
  onClose(): void;
}

const TILE_WIDTH = 50;
const HAND_TILE_WIDTH = TILE_WIDTH * 0.75;

const CalculatorModal: FC<ICalculatorModalProps> = (props) => {
  const {
    open,
    declaredSets: realDeclaredSets,
    hand: realHand,
    winningTile: realWinningTile,
    roundWind: realRoundWind,
    isRobbingKong: realIsRobbingKong,
    isReplacementTile: realIsReplacementTile,
    isLastWallTile: realIsLastWallTile,
    activePlayerIndex,
    player,
    players,
    onClose,
  } = props;

  const realSeatWind = player?.data.round?.wind ?? null;

  const [selectMode, setSelectMode] = useState(ESelectMode.WINNING_TILE);
  const [declaredSets, setDeclaredSets] = useState<TDeclaredSet[]>([]);
  const [hand, setHand] = useState<TTile[]>([]);
  const [winningTile, setWinningTile] = useState<TTile | null>(null);
  const [roundWind, setRoundWind] = useState<EWind | null>(EWind.EAST);
  const [seatWind, setSeatWind] = useState<EWind | null>(EWind.EAST);
  const [isSelfDraw, setIsSelfDraw] = useState(false);
  const [isRobbingKong, setIsRobbingKong] = useState(false);
  const [isReplacementTile, setIsReplacementTile] = useState(false);
  const [isLastWallTile, setIsLastWallTile] = useState(false);
  const [isLastOfKind, setIsLastOfKind] = useState(false);
  const [gameTakenIntoAccount, setGameTakenIntoAccount] = useState(true);
  const [shownMahjong, setShownMahjong] = useState<IHandMahjong | null>(null);

  const wasGameTakenIntoAccount = usePrevious(gameTakenIntoAccount);

  const knowsSetsCount = declaredSets.length;
  const canAddSets = getSupposedHandTileCount(knowsSetsCount) - hand.length >= 3;
  const canAddToHand = hand.length < getSupposedHandTileCount(knowsSetsCount);

  const selectOptions = useMemo<ISelectOption<ESelectMode>[]>(() => {
    return [
      { value: ESelectMode.CHOW, text: 'Чоу', disabled: !canAddSets },
      { value: ESelectMode.PUNG, text: 'Панг', disabled: !canAddSets },
      { value: ESelectMode.MELDED_KONG, text: 'Открытый конг', disabled: !canAddSets },
      { value: ESelectMode.CONCEALED_KONG, text: 'Закрытый конг', disabled: !canAddSets },
      { value: ESelectMode.HAND, text: 'В руку', disabled: !canAddToHand },
      { value: ESelectMode.WINNING_TILE, text: 'Выигрышную кость', disabled: canAddToHand },
    ];
  }, [canAddSets, canAddToHand]);

  const allMeldedTiles = useMemo<TTile[]>(() => {
    const meldedTiles: TTile[] = declaredSets.filter(isMelded).flatMap(({ tiles }) => tiles);

    if (gameTakenIntoAccount) {
      players.forEach((p) => {
        meldedTiles.push(...(p.data.hand?.discard ?? []));

        if (p.index !== player?.index) {
          meldedTiles.push(
            ...(p.data.hand?.declaredSets ?? []).filter(isDeclaredMeldedSet).flatMap(({ set }) => set.tiles),
          );
        }
      });
    }

    return meldedTiles;
  }, [declaredSets, gameTakenIntoAccount, player?.index, players]);

  const lastTileCandidates = useMemo<TTile[]>(() => {
    return getLastTileCandidatesFromTiles(allMeldedTiles, !gameTakenIntoAccount || isSelfDraw);
  }, [allMeldedTiles, gameTakenIntoAccount, isSelfDraw]);

  const allKnownTiles = useMemo<TTile[]>(() => {
    const allKnowsTiles = [
      ...(winningTile ? [winningTile] : []),
      ...hand,
      ...declaredSets.flatMap(({ tiles }) => tiles),
    ];

    if (gameTakenIntoAccount) {
      players.forEach((p) => {
        allKnowsTiles.push(...(p.data.hand?.discard ?? []));

        if (p.index !== player?.index) {
          p.data.hand?.declaredSets.forEach(({ set }) => {
            if (isMelded(set)) {
              allKnowsTiles.push(...set.tiles);
            }
          });
        }
      });
    }

    return allKnowsTiles;
  }, [declaredSets, gameTakenIntoAccount, hand, player?.index, players, winningTile]);

  const disabledTiles = useMemo<TPlayableTile[]>(() => {
    return STANDARD_TILES.filter((tile) => {
      const tileCount = getTileCount(allKnownTiles, tile);

      if (selectMode === ESelectMode.WINNING_TILE) {
        return tileCount >= 4 && !isEqualTiles(tile, winningTile);
      }

      if (selectMode === ESelectMode.HAND) {
        return tileCount >= 4;
      }

      if (selectMode === ESelectMode.PUNG) {
        return tileCount > 1;
      }

      if (selectMode === ESelectMode.MELDED_KONG || selectMode === ESelectMode.CONCEALED_KONG) {
        return tileCount > 0;
      }

      if (!isSuited(tile) || tile.value === 1 || tile.value === 9) {
        return true;
      }

      const chowTiles = chow(tile);

      return chowTiles.some((tile) => getTileCount(allKnownTiles, tile) >= 4);
    });
  }, [allKnownTiles, selectMode, winningTile]);

  const isRobbingKongAllowed = useMemo(() => {
    if (!winningTile) {
      return false;
    }

    if (gameTakenIntoAccount) {
      return realIsRobbingKong;
    }

    return getTileCount(allKnownTiles, winningTile) === 1;
  }, [allKnownTiles, gameTakenIntoAccount, realIsRobbingKong, winningTile]);

  const isReplacementTileAllowed = useMemo(() => {
    return declaredSets.some(isKong);
  }, [declaredSets]);

  const isLastOfKindAllowed = useMemo(() => {
    if (!winningTile) {
      return false;
    }

    return !tilesContainTile(hand, winningTile);
  }, [hand, winningTile]);

  const isNotLastOfKindAllowed = useMemo(() => {
    if (!winningTile) {
      return true;
    }

    return !tilesContainTile(lastTileCandidates, winningTile);
  }, [lastTileCandidates, winningTile]);

  const getHandScoreOptions = useCallback(
    (customWinningTile?: TTile | null, minScore?: number): IHandScoreOptions => {
      return {
        hand,
        declaredSets,
        flowers: [],
        roundWind,
        seatWind,
        minScore,
        lastTileCandidates:
          isLastOfKind && customWinningTile ? [customWinningTile, ...lastTileCandidates] : lastTileCandidates,
        isReplacementTile,
        isSelfDraw,
        isRobbingKong,
        isLastWallTile,
      };
    },
    [
      declaredSets,
      hand,
      isLastOfKind,
      isLastWallTile,
      isReplacementTile,
      isRobbingKong,
      isSelfDraw,
      lastTileCandidates,
      roundWind,
      seatWind,
    ],
  );

  const getMahjong = useImmutableCallback((customWinningTile?: TTile) => {
    const mahjongWinningTile = customWinningTile ?? winningTile;

    if (!mahjongWinningTile) {
      return null;
    }

    return getHandMahjong({
      ...getHandScoreOptions(mahjongWinningTile, 0),
      winningTile: mahjongWinningTile,
    });
  });

  const allWaits = useMemo<TTile[]>(() => {
    return getAllWaits(getHandScoreOptions(null, 0));
  }, [getHandScoreOptions]);

  const legalWaits = useMemo(() => {
    return getAllWaits(getHandScoreOptions());
  }, [getHandScoreOptions]);

  const reset = useCallback(
    (gameTakenIntoAccount: boolean) => {
      batchedUpdates(() => {
        setGameTakenIntoAccount(gameTakenIntoAccount);

        if (gameTakenIntoAccount) {
          if (realHand.length > getSupposedHandTileCount(realDeclaredSets.length)) {
            setHand(realHand.slice(0, -1));
            setWinningTile(realHand.at(-1) ?? null);
          } else {
            setHand(realHand);
            setWinningTile(realWinningTile);
          }

          setDeclaredSets(realDeclaredSets);
          setRoundWind(realRoundWind);
          setSeatWind(realSeatWind);
          setIsSelfDraw(player?.index === activePlayerIndex);
          setIsRobbingKong(realIsRobbingKong);
          setIsReplacementTile(realIsReplacementTile);
          setIsLastWallTile(realIsLastWallTile);
          setIsLastOfKind(realWinningTile ? tilesContainTile(lastTileCandidates, realWinningTile) : false);
        } else {
          setDeclaredSets([]);
          setHand([]);
          setWinningTile(null);
          setRoundWind(EWind.EAST);
          setSeatWind(EWind.EAST);
          setIsSelfDraw(false);
          setIsRobbingKong(false);
          setIsReplacementTile(false);
          setIsLastWallTile(false);
          setIsLastOfKind(false);
        }
      });
    },
    [
      activePlayerIndex,
      lastTileCandidates,
      player?.index,
      realDeclaredSets,
      realHand,
      realIsLastWallTile,
      realIsReplacementTile,
      realIsRobbingKong,
      realRoundWind,
      realSeatWind,
      realWinningTile,
    ],
  );

  const onTileClick = useCallback(
    (tile: TPlayableTile) => {
      if (selectMode === ESelectMode.WINNING_TILE) {
        return setWinningTile(tile);
      }

      if (selectMode === ESelectMode.HAND) {
        return setHand((hand) => [...hand, tile]);
      }

      let addedSet: TDeclaredSet;

      if (selectMode === ESelectMode.PUNG) {
        addedSet = {
          type: ESet.PUNG,
          tiles: pung(tile),
          concealedType: ESetConcealedType.MELDED,
        };
      } else if (selectMode === ESelectMode.MELDED_KONG || selectMode === ESelectMode.CONCEALED_KONG) {
        addedSet = {
          type: ESet.KONG,
          tiles: kong(tile),
          concealedType:
            selectMode === ESelectMode.MELDED_KONG ? ESetConcealedType.MELDED : ESetConcealedType.CONCEALED,
        };
      } else {
        if (!isSuited(tile)) {
          return;
        }

        addedSet = {
          type: ESet.CHOW,
          tiles: chow(tile),
          concealedType: ESetConcealedType.MELDED,
        };
      }

      setDeclaredSets((sets) => [...sets, addedSet]);
    },
    [selectMode],
  );

  const removeSet = useCallback((setIndex: number) => {
    setDeclaredSets((declaredSets) => [...declaredSets.slice(0, setIndex), ...declaredSets.slice(setIndex + 1)]);
  }, []);

  const removeTileFromHand = useCallback((tileIndex) => {
    setHand((hand) => [...hand.slice(0, tileIndex), ...hand.slice(tileIndex + 1)]);
  }, []);

  const removeWinningTile = useCallback(() => {
    setWinningTile(null);
  }, []);

  const calculateMahjong = useCallback(() => {
    setShownMahjong(getMahjong());
  }, [getMahjong]);

  const clear = useCallback(() => {
    batchedUpdates(() => {
      reset(gameTakenIntoAccount);
      setShownMahjong(null);
    });
  }, [gameTakenIntoAccount, reset]);

  const onWaitClick = useCallback(
    (wait: TTile) => {
      batchedUpdates(() => {
        setWinningTile(wait);
        setShownMahjong(getMahjong(wait));
      });
    },
    [getMahjong],
  );

  const handleRoundWindChange = useCallback((wind: EWind | '-') => {
    setRoundWind(wind === '-' ? null : wind);
  }, []);

  const handleSetWindChange = useCallback((wind: EWind | '-') => {
    setSeatWind(wind === '-' ? null : wind);
  }, []);

  useEffect(() => {
    if (!open) {
      reset(true);
      setShownMahjong(getMahjong() ?? null);
    }
  }, [getMahjong, open, reset]);

  useEffect(() => {
    if (!wasGameTakenIntoAccount && gameTakenIntoAccount) {
      reset(gameTakenIntoAccount);
    }
  }, [gameTakenIntoAccount, reset, wasGameTakenIntoAccount]);

  useEffect(() => {
    const selectedOption = selectOptions.find(({ value }) => value === selectMode);

    if (selectedOption?.disabled) {
      const isHandDisabled = selectOptions.find(({ value }) => value === ESelectMode.HAND)?.disabled;

      setSelectMode(isHandDisabled ? ESelectMode.WINNING_TILE : ESelectMode.HAND);
    }
  }, [selectMode, selectOptions]);

  useEffect(() => {
    if (!isRobbingKongAllowed) {
      setIsRobbingKong(false);
    }
  }, [isRobbingKongAllowed]);

  useEffect(() => {
    if (!isReplacementTileAllowed) {
      setIsReplacementTile(false);
    }
  }, [isReplacementTileAllowed]);

  useEffect(() => {
    if (!isLastOfKindAllowed) {
      setIsLastOfKind(false);
    }
  }, [isLastOfKindAllowed]);

  useEffect(() => {
    if (!isNotLastOfKindAllowed) {
      setIsLastOfKind(true);
    }
  }, [isNotLastOfKindAllowed]);

  return (
    <Modal containerClassName={styles.root} open={open} onClose={onClose}>
      <Flex direction="column" between={4}>
        <Flex justifyContent="spaceBetween" between={6}>
          <div className={styles.tilesGrid} style={{ gridTemplateColumns: `repeat(9, ${TILE_WIDTH}px)` }}>
            {STANDARD_TILES.map((tile, index) => {
              const isDisabled = tilesContainTile(disabledTiles, tile);

              return (
                <Tile
                  key={index}
                  className={classNames(styles.tile, {
                    [styles.disabled]: isDisabled,
                  })}
                  tile={tile}
                  width={TILE_WIDTH}
                  hoverable={!isDisabled}
                  onClick={() => onTileClick(tile)}
                />
              );
            })}
          </div>

          <Flex direction="column" between={6}>
            <Flex direction="column" between={1}>
              <Checkbox
                checked={gameTakenIntoAccount}
                label="Учитывать состояние игры"
                onChange={setGameTakenIntoAccount}
              />

              <Checkbox checked={isSelfDraw} label="Со стены" onChange={setIsSelfDraw} />

              <Checkbox
                checked={isRobbingKong}
                disabled={!isRobbingKongAllowed}
                label="Ограбление конга"
                onChange={setIsRobbingKong}
              />

              <Checkbox
                checked={isReplacementTile}
                disabled={!isReplacementTileAllowed}
                label="Замещающая кость"
                onChange={setIsReplacementTile}
              />

              <Checkbox
                checked={isLastOfKind}
                disabled={isLastOfKind ? !isNotLastOfKindAllowed : !isLastOfKindAllowed}
                label="Последняя своего типа"
                onChange={setIsLastOfKind}
              />

              <Checkbox checked={isLastWallTile} label="Последняя кость со стены" onChange={setIsLastWallTile} />
            </Flex>

            <Flex direction="column" between={1}>
              <Select
                value={roundWind ?? '-'}
                label="Ветер раунда"
                options={[
                  { value: '-', text: '-' },
                  ...ALL_WINDS.map((wind) => ({ value: wind, text: getWindHumanName(wind) })),
                ]}
                disabled={gameTakenIntoAccount}
                onChange={handleRoundWindChange}
              />

              <Select
                value={seatWind ?? '-'}
                label="Ветер игрока"
                options={[
                  { value: '-', text: '-' },
                  ...ALL_WINDS.map((wind) => ({ value: wind, text: getWindHumanName(wind) })),
                ]}
                disabled={gameTakenIntoAccount}
                onChange={handleSetWindChange}
              />
            </Flex>
          </Flex>

          <Flex direction="column" between={6}>
            <Flex direction="column" between={2}>
              <span>Добавить</span>

              <RadioGroup value={selectMode} options={selectOptions} onChange={setSelectMode} />
            </Flex>

            <Flex between={1}>
              <Button size="s" disabled={!getMahjong()} onClick={calculateMahjong}>
                Посчитать
              </Button>

              <Button size="s" onClick={clear}>
                Очистить
              </Button>
            </Flex>
          </Flex>
        </Flex>

        <Flex alignItems="center" between={6}>
          {declaredSets.map((set, index) => {
            const isAllowedToRemoveSet = !gameTakenIntoAccount || index >= realDeclaredSets.length;

            return (
              <Tiles
                key={index}
                tiles={set.tiles}
                tileWidth={HAND_TILE_WIDTH}
                openType={set.concealedType === ESetConcealedType.CONCEALED ? EOpenType.SEMI_CONCEALED : EOpenType.OPEN}
                onTileClick={isAllowedToRemoveSet ? () => removeSet(index) : undefined}
              />
            );
          })}

          <Tiles tiles={hand} tileWidth={HAND_TILE_WIDTH} onTileClick={removeTileFromHand} />

          {winningTile && <Tile tile={winningTile} width={HAND_TILE_WIDTH} onClick={removeWinningTile} />}
        </Flex>

        <Flex alignItems="center" between={6}>
          <div className={styles.waitsCaption}>Ожидания</div>

          <Flex style={{ height: getTileHeight(HAND_TILE_WIDTH) }}>
            {allWaits.map((wait, index) => {
              const isImpossible =
                !tilesContainTile(legalWaits, wait) ||
                getTileCount(allKnownTiles, wait) >= (isEqualTiles(wait, winningTile) ? 3 : 4);

              return (
                <Tile
                  key={index}
                  className={classNames(styles.tile, { [styles.impossible]: isImpossible })}
                  tile={wait}
                  width={HAND_TILE_WIDTH}
                  hoverable={!isImpossible}
                  onClick={() => onWaitClick(wait)}
                />
              );
            })}
          </Flex>
        </Flex>

        {shownMahjong && (
          <Mahjong
            mahjong={shownMahjong}
            tileWidth={HAND_TILE_WIDTH}
            showHand={false}
            showWaits={false}
            showScoreEval
          />
        )}
      </Flex>
    </Modal>
  );
};

export default memo(CalculatorModal);
