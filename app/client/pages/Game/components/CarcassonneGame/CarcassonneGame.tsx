import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import block from 'bem-cn';
import { useRecoilValue } from 'recoil';
import { forEach, map } from 'lodash';

import {
  ECarcassonneGameEvent,
  ICarcassonneAttachCardEvent,
  ICarcassonneCard,
  ICarcassonneGameInfoEvent,
  ICarcassonnePlayer,
  TCarcassonneBoard,
  TCarcassonneObjects,
} from 'common/types/carcassonne';
import { ICoords } from 'common/types';

import { getAttachedObjectId, getNeighborCoords, isSideObject } from 'common/utilities/carcassonne';

import Box from 'client/components/common/Box/Box';
import GameEnd from 'client/pages/Game/components/GameEnd/GameEnd';

import userAtom from 'client/atoms/userAtom';
import useGlobalListener from 'client/hooks/useGlobalListener';

interface ICarcassonneGameProps {
  io: SocketIOClient.Socket;
  isGameEnd: boolean;
}

const b = block('CarcassonneGame');

const BASE_CARD_SIZE = 100;

const Root = styled(Box)`
  .CarcassonneGame {
    position: relative;

    &__boardWrapper {
      height: calc(100vh - 48px);
      overflow: hidden;
    }

    &__board {
      transform-origin: 0 0;
    }

    &__card {
      position: absolute;
      top: 0;
      left: 0;
      flex-shrink: 0;
      width: ${BASE_CARD_SIZE}px;
      height: ${BASE_CARD_SIZE}px;
      border: 1px solid #ddd;
    }

    &__cardImage {
      width: 100%;
      height: 100%;
      pointer-events: none;
      user-select: none;
    }

    &__hand {
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
    }

    &__handCard {
      width: ${BASE_CARD_SIZE}px;
      height: ${BASE_CARD_SIZE}px;
      border: 1px solid #ddd;

      &_selected {
        border: 1px solid #f00;
      }
    }

    &__handCardImage {
      width: 100%;
      height: 100%;
    }

    &__draggingCard {
      position: fixed;
      top: 0;
      left: 0;
      width: ${BASE_CARD_SIZE}px;
      height: ${BASE_CARD_SIZE}px;
      pointer-events: none;
    }

    &__draggingCardImage {
      width: 100%;
      height: 100%;
    }

    &__allowedMove {
      position: absolute;
      top: 0;
      left: 0;
      width: ${BASE_CARD_SIZE}px;
      height: ${BASE_CARD_SIZE}px;
    }

    &__selectedCard {
      display: none;
      width: ${BASE_CARD_SIZE}px;
      height: ${BASE_CARD_SIZE}px;
      pointer-events: none;
    }

    &__selectedCardImage {
      width: 100%;
      height: 100%;
    }
  }
`;

const CarcassonneGame: React.FC<ICarcassonneGameProps> = (props) => {
  const { io, isGameEnd } = props;

  const [players, setPlayers] = useState<ICarcassonnePlayer[]>([]);
  const [board, setBoard] = useState<TCarcassonneBoard>({});
  const [objects, setObjects] = useState<TCarcassonneObjects>({});
  const [selectedCardIndex, setSelectedCardIndex] = useState<number>(-1);
  const [allowedMoves, setAllowedMoves] = useState<ICoords[]>([]);

  const boardWrapperRef = useRef<HTMLDivElement | null>(null);
  const boardRef = useRef<HTMLDivElement | null>(null);
  const draggingCardRef = useRef<HTMLDivElement | null>(null);
  const selectedCardRef = useRef<HTMLDivElement | null>(null);

  const user = useRecoilValue(userAtom);

  const player = useMemo(() => {
    return players.find(({ login }) => login === user?.login);
  }, [players, user]);

  const boardTranslateRef = useRef<ICoords>({ x: 0, y: 0 });
  const boardZoomRef = useRef<number>(1);
  const lastDragPointRef = useRef<ICoords | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const selectedCardRotationRef = useRef<number>(0);

  const selectedCard = player?.cards[selectedCardIndex];

  const calculateAllowedMoves = useCallback((selectedCard: ICarcassonneCard | undefined) => {
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

          const isMatching = selectedCard.objects.filter(isSideObject).every((object) => {
            return object.sideParts.every((sidePart) => {
              const rotatedSidePart = (sidePart + 3 * selectedCardRotationRef.current) % 12;
              const attachedObjectId = getAttachedObjectId({
                card: neighborCoords,
                sidePart: rotatedSidePart,
              }, board);

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

    console.log(allowedMoves);

    setAllowedMoves(allowedMoves);
  }, [board, objects]);

  const transformBoard = useCallback(() => {
    if (!boardRef.current || !boardTranslateRef.current) {
      return;
    }

    boardRef.current.style.transform = `
      translate(${boardTranslateRef.current.x}px, ${boardTranslateRef.current.y}px)
      scale(${boardZoomRef.current})
    `;
  }, []);

  const transformDraggingCard = useCallback((e: React.MouseEvent | MouseEvent) => {
    const draggingCardElem = draggingCardRef.current;

    if (!draggingCardElem) {
      return;
    }

    draggingCardElem.style.transform = `
      translate(calc(${e.clientX}px - 50%), calc(${e.clientY}px - 50%))
      scale(${boardZoomRef.current})
      rotate(${selectedCardRotationRef.current * 90}deg)
    `;
  }, []);

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

  const attachCard = useCallback((coords: ICoords) => {
    if (!selectedCard) {
      return;
    }

    const attachCardEvent: ICarcassonneAttachCardEvent = {
      card: selectedCard,
      coords,
      rotation: selectedCardRotationRef.current,
    };

    setSelectedCardIndex(-1);

    io.emit(ECarcassonneGameEvent.ATTACH_CARD, attachCardEvent);
  }, [io, selectedCard]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDraggingRef.current = true;
    lastDragPointRef.current = {
      x: e.clientX,
      y: e.clientY,
    };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDraggingRef.current || !lastDragPointRef.current || !boardRef.current) {
      return;
    }

    const dx = e.clientX - lastDragPointRef.current.x;
    const dy = e.clientY - lastDragPointRef.current.y;

    const currentTranslateX = boardTranslateRef.current.x + dx;
    const currentTranslateY = boardTranslateRef.current.y + dy;

    boardTranslateRef.current = {
      x: currentTranslateX,
      y: currentTranslateY,
    };

    lastDragPointRef.current = {
      x: e.clientX,
      y: e.clientY,
    };

    transformBoard();
  }, [transformBoard]);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
    lastDragPointRef.current = null;
  }, []);

  const handleMouseWheel = useCallback((e: React.WheelEvent) => {
    if (!boardWrapperRef.current || !boardTranslateRef.current) {
      return;
    }

    const viewPortHeight = boardWrapperRef.current.offsetHeight;
    const viewPortWidth = boardWrapperRef.current.offsetWidth;

    const oldZoom = boardZoomRef.current;
    const newZoom = oldZoom * (1 - 0.1 * Math.sign(e.deltaY));

    const newTransformY = viewPortHeight / 2 - (viewPortHeight / 2 - boardTranslateRef.current.y) * newZoom / oldZoom;
    const newTransformX = viewPortWidth / 2 - (viewPortWidth / 2 - boardTranslateRef.current.x) * newZoom / oldZoom;

    boardZoomRef.current = newZoom;
    boardTranslateRef.current = {
      x: newTransformX,
      y: newTransformY,
    };

    transformBoard();
    transformDraggingCard(e);
  }, [transformBoard, transformDraggingCard]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();

    selectedCardRotationRef.current = (selectedCardRotationRef.current + 1) % 4;

    hideSelectedCard();
    calculateAllowedMoves(selectedCard);
    transformDraggingCard(e);
  }, [calculateAllowedMoves, hideSelectedCard, selectedCard, transformDraggingCard]);

  const selectCard = useCallback((e: React.MouseEvent, index: number) => {
    selectedCardRotationRef.current = 0;

    setSelectedCardIndex(index);
    calculateAllowedMoves(player?.cards[index]);
    transformDraggingCard(e);
  }, [calculateAllowedMoves, player, transformDraggingCard]);

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

  useGlobalListener('mousemove', document, (e) => {
    if (selectedCard) {
      transformDraggingCard(e);
    }
  });

  useEffect(() => {
    io.emit(ECarcassonneGameEvent.GET_GAME_INFO);

    io.on(ECarcassonneGameEvent.GAME_INFO, (gameInfo: ICarcassonneGameInfoEvent) => {
      if (!user) {
        return;
      }

      console.log(ECarcassonneGameEvent.GAME_INFO, gameInfo);

      setPlayers(gameInfo.players);
      setBoard(gameInfo.board);
      setObjects(gameInfo.objects);
    });

    return () => {
      io.off(ECarcassonneGameEvent.GAME_INFO);
    };
  }, [io, user]);

  useEffect(() => {
    if (!boardWrapperRef.current || !boardRef.current) {
      return;
    }

    const dy = Math.round((boardWrapperRef.current.offsetHeight - BASE_CARD_SIZE) / 2);
    const dx = Math.round((boardWrapperRef.current.offsetWidth - BASE_CARD_SIZE) / 2);

    boardTranslateRef.current = { x: dx, y: dy };

    transformBoard();
  }, [transformBoard]);

  if (isGameEnd) {
    return (
      <GameEnd />
    );
  }

  return (
    <Root className={b()}>
      <div
        className={b('boardWrapper')}
        ref={boardWrapperRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleMouseWheel}
        onContextMenu={handleContextMenu}
      >
        <div
          className={b('board')}
          ref={boardRef}
        >
          {map(board, (row) => (
            map(row, (card) => {
              return card && (
                <div
                  className={b('card')}
                  key={`${card.y}-${card.x}`}
                  style={{
                    transform: `
                      translate(${card.x * BASE_CARD_SIZE}px, ${card.y * BASE_CARD_SIZE}px)
                      rotate(${card.rotation * 90}deg)
                    `,
                  }}
                >
                  <img className={b('cardImage')} src={`/carcassonne/tiles/${card.id}.jpg`} />
                </div>
              );
            })
          ))}

          {allowedMoves.map((coords) => {
            return (
              <div
                key={`${coords.y}-${coords.x}`}
                className={b('allowedMove')}
                style={{
                  transform: `translate(${coords.x * BASE_CARD_SIZE}px, ${coords.y * BASE_CARD_SIZE}px)`,
                }}
                onMouseEnter={() => onAllowedMoveEnter(coords)}
                onMouseLeave={() => onAllowedMoveLeave()}
                onClick={() => attachCard(coords)}
              />
            );
          })}

          <div className={b('selectedCard')} ref={selectedCardRef}>
            {selectedCard && (
              <img
                className={b('selectedCardImage')}
                src={`/carcassonne/tiles/${selectedCard.id}.jpg`}
              />
            )}
          </div>
        </div>
      </div>

      <Box className={b('hand')} flex>
        {player?.cards.map((card, index) => {
          return (
            <div
              key={index}
              className={b('handCard', { selected: index === selectedCardIndex })}
              onClick={(e) => selectCard(e, index)}
            >
              <img
                className={b('handCardImage')}
                src={`/carcassonne/tiles/${card.id}.jpg`}
              />
            </div>
          );
        })}
      </Box>

      <div className={b('draggingCard')} ref={draggingCardRef}>
        {selectedCard && (
          <img className={b('draggingCardImage')} src={`/carcassonne/tiles/${selectedCard.id}.jpg`} />
        )}
      </div>
    </Root>
  );
};

export default React.memo(CarcassonneGame);
