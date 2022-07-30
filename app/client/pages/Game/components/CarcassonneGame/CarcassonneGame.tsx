import React, { useCallback, useEffect, useRef, useState } from 'react';
import forEach from 'lodash/forEach';
import map from 'lodash/map';
import classNames from 'classnames';

import { BASE_CARD_SIZE, MEEPLE_SIZE } from 'client/pages/Game/components/CarcassonneGame/constants';
import { ALL_CARDS } from 'common/constants/games/carcassonne';

import {
  EGameClientEvent,
  EMeepleType,
  IAttachCardEvent,
  ICard,
  IPlacedMeeple,
  IPlayer,
  TBoard,
  TObjects,
} from 'common/types/carcassonne';
import { ICoords } from 'common/types';
import { EGame } from 'common/types/game';

import {
  getAttachedObjectId,
  getNeighborCoords,
  getObjectPlayerMeeples,
  isCardCity,
  isCardField,
  isCardMonastery,
  isCardRoad,
  isSideObject,
} from 'common/utilities/carcassonne';
import { getRotatedCoords } from 'client/pages/Game/components/CarcassonneGame/utilities/coords';

import Players from 'client/pages/Game/components/CarcassonneGame/components/Player/Players';
import Meeple from 'client/pages/Game/components/CarcassonneGame/components/Meeple/Meeple';
import useBoardControl from 'client/pages/Game/components/CarcassonneGame/hooks/useBoardControl';
import Image from 'client/components/common/Image/Image';
import Flex from 'client/components/common/Flex/Flex';

import useGlobalListener from 'client/hooks/useGlobalListener';
import { playSound, POP_SOUND } from 'client/sounds';
import { IGameProps } from 'client/pages/Game/Game';
import usePlayer from 'client/hooks/usePlayer';

import styles from './CarcassonneGame.pcss';

const CarcassonneGame: React.FC<IGameProps<EGame.CARCASSONNE>> = (props) => {
  const { io, gameInfo, timeDiff } = props;

  const [players, setPlayers] = useState<IPlayer[]>([]);
  const [activePlayerIndex, setActivePlayerIndex] = useState(-1);
  const [board, setBoard] = useState<TBoard>({});
  const [objects, setObjects] = useState<TObjects>({});
  const [cardsLeft, setCardsLeft] = useState<number>(0);
  const [turnEndsAt, setTurnEndsAt] = useState<number | null>(null);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number>(-1);
  const [placedCardCoords, setPlacedCardCoords] = useState<ICoords | null>(null);
  const [allowedMoves, setAllowedMoves] = useState<ICoords[]>([]);
  const [allowedMeeples, setAllowedMeeples] = useState<(EMeepleType[] | null)[]>();

  const draggingCardRef = useRef<HTMLDivElement | null>(null);
  const selectedCardRef = useRef<HTMLDivElement | null>(null);
  const boardCardsCountRef = useRef<number | null>(null);

  const player = usePlayer(players);

  const selectedCardRotationRef = useRef<number>(0);

  const selectedCard = player?.data.cards[selectedCardIndex];

  const calculateAllowedMoves = useCallback(
    (selectedCard: ICard | undefined) => {
      if (!selectedCard) {
        return;
      }

      const allowedMoves: ICoords[] = [];
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

  const transformDraggingCard = useCallback((e: React.MouseEvent | MouseEvent, zoom: number) => {
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
    (coords: ICoords) => {
      if (!selectedCard || !player || placedCardCoords || !isAbleToPlaceCard) {
        return;
      }

      setPlacedCardCoords(coords);

      const allowedMeeples = selectedCard.objects.map((object) => {
        if (isCardMonastery(object)) {
          return [EMeepleType.COMMON, EMeepleType.FAT];
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
          return [EMeepleType.COMMON, EMeepleType.FAT];
        }

        if ((isCardCity(object) || isCardRoad(object)) && hasOurMeeple) {
          return [EMeepleType.BUILDER];
        }

        if (isCardField(object) && hasOurMeeple) {
          return [EMeepleType.PIG];
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
    (placedMeeple: IPlacedMeeple | null) => {
      if (!selectedCard || !player || !placedCardCoords) {
        return;
      }

      const rotation = selectedCardRotationRef.current;
      const attachCardEvent: IAttachCardEvent = {
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

      io.emit(EGameClientEvent.ATTACH_CARD, attachCardEvent);
    },
    [board, hideSelectedCard, io, placedCardCoords, player, selectedCard, selectedCardIndex],
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
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
    (e: React.MouseEvent, index: number) => {
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

  const onAllowedMoveEnter = useCallback(({ x, y }: ICoords) => {
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
    (placedMeeple: IPlacedMeeple) => {
      attachCard(placedMeeple);
    },
    [attachCard],
  );

  useGlobalListener('mousemove', document, (e) => {
    if (selectedCard && !placedCardCoords) {
      transformDraggingCard(e, boardZoomRef.current);
    }
  });

  useEffect(() => {
    console.log(gameInfo);

    setPlayers(gameInfo.players);
    setActivePlayerIndex(gameInfo.activePlayerIndex);
    setBoard(gameInfo.board);
    setObjects(gameInfo.objects);
    setCardsLeft(gameInfo.cardsLeft);
    setTurnEndsAt(gameInfo.turn?.endsAt ?? null);

    const boardCardsCount =
      gameInfo.cardsLeft +
      gameInfo.players.reduce((playersCardsCount, player) => playersCardsCount + player.data.cards.length, 0);

    if (boardCardsCountRef.current && boardCardsCountRef.current !== boardCardsCount) {
      playSound(POP_SOUND);
    }

    boardCardsCountRef.current = boardCardsCount;
  }, [gameInfo]);

  return (
    <div className={styles.root}>
      <div
        className={styles.boardWrapper}
        ref={boardWrapperRef}
        onMouseDown={handleBoardMouseDown}
        onMouseMove={handleBoardMouseMove}
        onMouseUp={handleBoardMouseUp}
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
        activePlayerIndex={activePlayerIndex}
        timeDiff={timeDiff}
        turnEndsAt={turnEndsAt}
      />

      <div className={styles.cardsLeft}>{cardsLeft}</div>

      <div className={styles.draggingCard} ref={draggingCardRef}>
        {selectedCard && (
          <Image className={styles.draggingCardImage} src={`/carcassonne/tiles/${selectedCard.id}.jpg`} />
        )}
      </div>
    </div>
  );
};

export default React.memo(CarcassonneGame);
