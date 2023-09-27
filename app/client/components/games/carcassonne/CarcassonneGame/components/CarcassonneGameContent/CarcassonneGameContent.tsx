import classNames from 'classnames';
import forEach from 'lodash/forEach';
import map from 'lodash/map';
import reduce from 'lodash/reduce';
import { FC, MouseEvent as ReactMouseEvent, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  BASE_CARD_SIZE,
  MEEPLE_SIZE,
} from 'client/components/games/carcassonne/CarcassonneGame/components/CarcassonneGameContent/constants';
import { ALL_CARDS } from 'common/constants/games/carcassonne';

import { Coords } from 'common/types';
import { GameType } from 'common/types/game';
import { AttachCardEvent, Card, GameClientEventType, MeepleType, PlacedMeeple } from 'common/types/games/carcassonne';

import { getRotatedCoords } from 'client/components/games/carcassonne/CarcassonneGame/components/CarcassonneGameContent/utilities/coords';
import {
  getAttachedObjectId,
  getNeighborCoords,
  getObjectPlayerMeeples,
  isCardCity,
  isCardField,
  isCardMonastery,
  isCardRoad,
  isSideObject,
} from 'common/utilities/games/carcassonne';

import useBoundTimestamps from 'client/components/game/Game/hooks/useBoundTimetamps';
import useCreateTimestamp from 'client/components/game/Game/hooks/useCreateTimestamp';
import useBoardControl from 'client/components/games/carcassonne/CarcassonneGame/components/CarcassonneGameContent/hooks/useBoardControl';
import useGlobalListener from 'client/hooks/useGlobalListener';
import usePlayer from 'client/hooks/usePlayer';
import usePrevious from 'client/hooks/usePrevious';

import Flex from 'client/components/common/Flex/Flex';
import Image from 'client/components/common/Image/Image';
import { GameContentProps } from 'client/components/game/Game/Game';
import GameContent from 'client/components/game/GameContent/GameContent';
import Meeple from 'client/components/games/carcassonne/CarcassonneGame/components/CarcassonneGameContent/components/Meeple/Meeple';
import Players from 'client/components/games/carcassonne/CarcassonneGame/components/CarcassonneGameContent/components/Player/Players';

import { POP_SOUND, playSound } from 'client/sounds';

import styles from './CarcassonneGameContent.module.scss';

const CarcassonneGameContent: FC<GameContentProps<GameType.CARCASSONNE>> = (props) => {
  const {
    io,
    gameOptions,
    gameInfo,
    gameInfo: { players, activePlayerIndex, board, objects, cardsLeft },
  } = props;

  const createTimestamp = useCreateTimestamp();

  const [selectedCardIndex, setSelectedCardIndex] = useState<number>(-1);
  const [placedCardCoords, setPlacedCardCoords] = useState<Coords | null>(null);
  const [allowedMoves, setAllowedMoves] = useState<Coords[]>([]);
  const [allowedMeeples, setAllowedMeeples] = useState<(MeepleType[] | null)[]>();

  const draggingCardRef = useRef<HTMLDivElement | null>(null);
  const selectedCardRef = useRef<HTMLDivElement | null>(null);
  const selectedCardRotationRef = useRef<number>(0);

  const player = usePlayer(players);

  const selectedCard = player?.data.cards[selectedCardIndex];

  const serverTurnEndsAt = useMemo(() => {
    return createTimestamp(gameInfo.turn?.endsAt);
  }, [createTimestamp, gameInfo.turn?.endsAt]);

  const boardCardsCount = useMemo(() => {
    return reduce(
      board,
      (boardCardsCount, row) =>
        reduce(row, (boardCardsCount, card) => boardCardsCount + (card ? 1 : 0), boardCardsCount),
      0,
    );
  }, [board]);

  const previousBoardCardsCount = usePrevious(boardCardsCount);

  const calculateAllowedMoves = useCallback(
    (selectedCard: Card | undefined) => {
      if (!selectedCard) {
        return;
      }

      const allowedMoves: Coords[] = [];
      const traversedCoords = new Set<string>();

      forEach(board, (row) => {
        forEach(row, (card) => {
          if (!card) {
            return;
          }

          [0, 1, 2, 3].forEach((side) => {
            const neighborCoords = getNeighborCoords(card, side);
            const key = `${neighborCoords.y}-${neighborCoords.x}`;

            if (traversedCoords.has(key)) {
              return;
            }

            traversedCoords.add(key);

            if (board[neighborCoords.y]?.[neighborCoords.x]) {
              return;
            }

            const isMatching = selectedCard.objects.filter(isSideObject).every((object) => {
              return object.sideParts.every((sidePart) => {
                const rotatedSidePart = (sidePart + 3 * selectedCardRotationRef.current) % 12;
                const attachedObjectId = getAttachedObjectId(neighborCoords, rotatedSidePart, board);

                if (!attachedObjectId) {
                  return true;
                }

                const attachedObject = objects[attachedObjectId];

                return !attachedObject || attachedObject.type === object.type;
              });
            });

            if (isMatching) {
              allowedMoves.push(neighborCoords);
            }
          });
        });
      });

      setAllowedMoves(allowedMoves);
    },
    [board, objects],
  );

  const transformDraggingCard = useCallback((e: ReactMouseEvent | MouseEvent, zoom: number) => {
    const draggingCardElem = draggingCardRef.current;

    if (!draggingCardElem) {
      return;
    }

    draggingCardElem.style.transform = `
      translate(calc(${e.clientX}px - 50%), calc(${e.clientY}px - 50%))
      scale(${zoom})
      rotate(${selectedCardRotationRef.current * 90}deg)
    `;
  }, []);

  const {
    boardWrapperRef,
    boardRef,
    zoomRef: boardZoomRef,
    isAbleToPlaceCard,
    handleMouseDown: handleBoardMouseDown,
    handleMouseMove: handleBoardMouseMove,
    handleMouseUp: handleBoardMouseUp,
    handleMouseWheel: handleBoardMouseWheel,
  } = useBoardControl({ onZoom: transformDraggingCard });

  const hideSelectedCard = useCallback(() => {
    const selectedCardElem = selectedCardRef.current;
    const draggingCardElem = draggingCardRef.current;

    if (selectedCardElem) {
      selectedCardElem.style.display = '';
    }

    if (draggingCardElem) {
      draggingCardElem.style.display = '';
    }
  }, []);

  const placeCard = useCallback(
    (coords: Coords) => {
      if (!selectedCard || !player || placedCardCoords || !isAbleToPlaceCard) {
        return;
      }

      setPlacedCardCoords(coords);

      const allowedMeeples = selectedCard.objects.map((object) => {
        if (isCardMonastery(object)) {
          return [MeepleType.COMMON, MeepleType.FAT];
        }

        let isOccupied = false;
        let hasOurMeeple = false;

        object.sideParts.forEach((sidePart) => {
          const rotatedSidePart = (sidePart + 3 * selectedCardRotationRef.current) % 12;
          const attachedObjectId = getAttachedObjectId(coords, rotatedSidePart, board);

          if (!attachedObjectId) {
            return;
          }

          const attachedObject = objects[attachedObjectId];

          if (!attachedObject) {
            return;
          }

          if (attachedObject.meeples.length > 0) {
            isOccupied = true;
          }

          if (getObjectPlayerMeeples(attachedObject, player.index).length > 0) {
            hasOurMeeple = true;
          }
        });

        if (!isOccupied) {
          return [MeepleType.COMMON, MeepleType.FAT];
        }

        if ((isCardCity(object) || isCardRoad(object)) && hasOurMeeple) {
          return [MeepleType.BUILDER];
        }

        if (isCardField(object) && hasOurMeeple) {
          return [MeepleType.PIG];
        }

        return null;
      });

      setAllowedMeeples(
        allowedMeeples.map((meepleTypes) => {
          const filteredMeepleTypes =
            meepleTypes && meepleTypes.filter((meepleType) => player.data.meeples[meepleType] > 0);

          return filteredMeepleTypes && filteredMeepleTypes.length > 0 ? filteredMeepleTypes : null;
        }),
      );
    },
    [board, isAbleToPlaceCard, objects, placedCardCoords, player, selectedCard],
  );

  const attachCard = useCallback(
    (placedMeeple: PlacedMeeple | null) => {
      if (!selectedCard || !player || !placedCardCoords) {
        return;
      }

      const rotation = selectedCardRotationRef.current;
      const attachCardEvent: AttachCardEvent = {
        cardIndex: selectedCardIndex,
        coords: placedCardCoords,
        rotation,
        meeple: placedMeeple,
      };

      (board[placedCardCoords.y] ||= {})[placedCardCoords.x] = {
        ...placedCardCoords,
        id: selectedCard.id,
        rotation,
        objectsBySideParts: [],
        monasteryId: null,
        meeple: placedMeeple && {
          ...placedMeeple,
          playerIndex: player.index,
          gameObjectId: 0,
        },
      };

      setSelectedCardIndex(-1);
      setAllowedMoves([]);
      setPlacedCardCoords(null);

      hideSelectedCard();

      io.emit(GameClientEventType.ATTACH_CARD, attachCardEvent);
    },
    [board, hideSelectedCard, io, placedCardCoords, player, selectedCard, selectedCardIndex],
  );

  const handleContextMenu = useCallback(
    (e: ReactMouseEvent) => {
      e.preventDefault();

      if (placedCardCoords) {
        return;
      }

      selectedCardRotationRef.current = (selectedCardRotationRef.current + 1) % 4;

      hideSelectedCard();
      calculateAllowedMoves(selectedCard);
      transformDraggingCard(e, boardZoomRef.current);
    },
    [boardZoomRef, calculateAllowedMoves, hideSelectedCard, placedCardCoords, selectedCard, transformDraggingCard],
  );

  const onHandCardClick = useCallback(
    (e: ReactMouseEvent, index: number) => {
      if (player?.index !== activePlayerIndex) {
        return;
      }

      if (index === selectedCardIndex) {
        setSelectedCardIndex(-1);
        setAllowedMoves([]);
      } else {
        selectedCardRotationRef.current = 0;

        setSelectedCardIndex(index);
        calculateAllowedMoves(player?.data.cards[index]);
        transformDraggingCard(e, boardZoomRef.current);
      }

      hideSelectedCard();
      setPlacedCardCoords(null);
    },
    [
      activePlayerIndex,
      boardZoomRef,
      calculateAllowedMoves,
      hideSelectedCard,
      player,
      selectedCardIndex,
      transformDraggingCard,
    ],
  );

  const onAllowedMoveEnter = useCallback(({ x, y }: Coords) => {
    const selectedCardElem = selectedCardRef.current;
    const draggingCardElem = draggingCardRef.current;

    if (selectedCardElem) {
      selectedCardElem.style.display = 'block';
      selectedCardElem.style.transform = `
        translate(${x * BASE_CARD_SIZE}px, ${y * BASE_CARD_SIZE}px)
        rotate(${selectedCardRotationRef.current * 90}deg)
      `;
    }

    if (draggingCardElem) {
      draggingCardElem.style.display = 'none';
    }
  }, []);

  const onAllowedMoveLeave = useCallback(() => {
    hideSelectedCard();
  }, [hideSelectedCard]);

  const onPlaceMeepleClick = useCallback(
    (placedMeeple: PlacedMeeple) => {
      attachCard(placedMeeple);
    },
    [attachCard],
  );

  useBoundTimestamps(() => [serverTurnEndsAt]);

  useGlobalListener('mousemove', document, (e) => {
    handleBoardMouseMove(e);

    if (selectedCard && !placedCardCoords) {
      transformDraggingCard(e, boardZoomRef.current);
    }
  });

  useGlobalListener('mouseup', document, handleBoardMouseUp);

  useEffect(() => {
    console.log(gameInfo);
  }, [gameInfo]);

  useEffect(() => {
    if (boardCardsCount > previousBoardCardsCount) {
      playSound(POP_SOUND);
    }
  }, [boardCardsCount, previousBoardCardsCount]);

  return (
    <GameContent>
      <div className={styles.root}>
        <div
          className={styles.boardWrapper}
          ref={boardWrapperRef}
          onMouseDown={handleBoardMouseDown}
          onWheel={handleBoardMouseWheel}
          onContextMenu={handleContextMenu}
        >
          <div className={styles.board} ref={boardRef}>
            {map(board, (row) =>
              map(row, (card) => {
                return (
                  card && (
                    <div
                      className={styles.card}
                      key={`${card.y}-${card.x}`}
                      style={{
                        transform: `
                      translate(${card.x * BASE_CARD_SIZE}px, ${card.y * BASE_CARD_SIZE}px)
                      rotate(${card.rotation * 90}deg)
                    `,
                      }}
                    >
                      <Image className={styles.cardImage} src={`/carcassonne/tiles/${card.id}.jpg`} />
                    </div>
                  )
                );
              }),
            )}

            {players.map(({ data: { color, lastMoves } }) =>
              lastMoves.map((coords, index) => {
                return (
                  <div
                    key={index}
                    className={styles.lastMoveContainer}
                    style={{
                      transform: `translate(${coords.x * BASE_CARD_SIZE}px, ${coords.y * BASE_CARD_SIZE}px)`,
                    }}
                  >
                    <div
                      className={styles.lastMove}
                      style={{
                        borderColor: color,
                      }}
                    />
                  </div>
                );
              }),
            )}

            {map(board, (row) =>
              map(row, (card) => {
                const meepleCoords = card?.meeple && ALL_CARDS[card.id].objects[card.meeple.cardObjectId].meepleCoords;

                if (!card?.meeple || !meepleCoords) {
                  return;
                }

                const rotatedCoords = getRotatedCoords(meepleCoords, card.rotation);

                return (
                  <Meeple
                    key={card.x}
                    className={styles.meeple}
                    type={card.meeple.type}
                    color={players[card.meeple.playerIndex].data.color}
                    style={{
                      transform: `
                      translate(
                        calc(${(card.x + rotatedCoords.x) * BASE_CARD_SIZE}px - 50%),
                        calc(${(card.y + rotatedCoords.y) * BASE_CARD_SIZE}px - 50%)
                      )
                    `,
                    }}
                  />
                );
              }),
            )}

            {allowedMoves.map((coords) => {
              return (
                <div
                  key={`${coords.y}-${coords.x}`}
                  className={styles.allowedMove}
                  style={{
                    transform: `translate(${coords.x * BASE_CARD_SIZE}px, ${coords.y * BASE_CARD_SIZE}px)`,
                  }}
                  onMouseEnter={placedCardCoords ? undefined : () => onAllowedMoveEnter(coords)}
                  onMouseLeave={placedCardCoords ? undefined : () => onAllowedMoveLeave()}
                  onClick={() => placeCard(coords)}
                />
              );
            })}

            <div
              className={classNames(styles.selectedCard, { [styles.placed]: !!placedCardCoords })}
              ref={selectedCardRef}
              onClick={() => attachCard(null)}
            >
              {selectedCard && (
                <>
                  <Image className={styles.selectedCardImage} src={`/carcassonne/tiles/${selectedCard.id}.jpg`} />

                  {placedCardCoords &&
                    selectedCard.objects.map(({ meepleCoords }, objectId) => {
                      const objectAllowedMeeples = allowedMeeples?.[objectId];

                      if (!objectAllowedMeeples) {
                        return;
                      }

                      return (
                        <div
                          key={objectId}
                          className={styles.allowedMeeplePlace}
                          style={{
                            transform: `translate(
                          calc(${meepleCoords.x * BASE_CARD_SIZE}px - 50%),
                          calc(${meepleCoords.y * BASE_CARD_SIZE}px - 50%)
                        )`,
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className={styles.allowedMeeplePlaceCircle} />

                          {player && (
                            <div
                              className={styles.allowedMeeples}
                              style={{
                                transform: `
                              rotate(-${selectedCardRotationRef.current * 90}deg)
                              translate(calc(${MEEPLE_SIZE / 2}px - 50%), -100%)
                            `,
                              }}
                            >
                              {objectAllowedMeeples.map((meepleType) => {
                                return (
                                  <Meeple
                                    key={meepleType}
                                    className={styles.allowedMeeple}
                                    type={meepleType}
                                    color={player.data.color}
                                    onClick={() => onPlaceMeepleClick({ type: meepleType, cardObjectId: objectId })}
                                  />
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </>
              )}
            </div>
          </div>
        </div>

        <Flex className={styles.hand} between={1}>
          {player?.data.cards.map((card, index) => {
            return (
              <div
                key={index}
                className={classNames(styles.handCard, { [styles.selected]: index === selectedCardIndex })}
                onClick={(e) => onHandCardClick(e, index)}
              >
                <Image className={styles.handCardImage} src={`/carcassonne/tiles/${card.id}.jpg`} />
              </div>
            );
          })}
        </Flex>

        <Players
          className={styles.players}
          players={players}
          gameOptions={gameOptions}
          activePlayerIndex={activePlayerIndex}
          turnEndsAt={serverTurnEndsAt}
        />

        <Flex className={styles.cardsLeft} alignItems="center" justifyContent="center">
          {cardsLeft}
        </Flex>

        <div className={styles.draggingCard} ref={draggingCardRef}>
          {selectedCard && (
            <Image className={styles.draggingCardImage} src={`/carcassonne/tiles/${selectedCard.id}.jpg`} />
          )}
        </div>
      </div>
    </GameContent>
  );
};

export default memo(CarcassonneGameContent);
