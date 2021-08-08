import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import block from 'bem-cn';
import { useRecoilValue } from 'recoil';
import { forEach, map } from 'lodash';

import { BASE_CARD_SIZE } from 'client/pages/Game/components/CarcassonneGame/constants';

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
import useBoardControl from 'client/pages/Game/components/CarcassonneGame/hooks/useBoardControl';

import userAtom from 'client/atoms/userAtom';
import useGlobalListener from 'client/hooks/useGlobalListener';

interface ICarcassonneGameProps {
  io: SocketIOClient.Socket;
  isGameEnd: boolean;
}

const b = block('CarcassonneGame');

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

  const draggingCardRef = useRef<HTMLDivElement | null>(null);
  const selectedCardRef = useRef<HTMLDivElement | null>(null);

  const user = useRecoilValue(userAtom);

  const player = useMemo(() => {
    return players.find(({ login }) => login === user?.login);
  }, [players, user]);

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

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();

    selectedCardRotationRef.current = (selectedCardRotationRef.current + 1) % 4;

    hideSelectedCard();
    calculateAllowedMoves(selectedCard);
    transformDraggingCard(e, boardZoomRef.current);
  }, [boardZoomRef, calculateAllowedMoves, hideSelectedCard, selectedCard, transformDraggingCard]);

  const selectCard = useCallback((e: React.MouseEvent, index: number) => {
    selectedCardRotationRef.current = 0;

    setSelectedCardIndex(index);
    calculateAllowedMoves(player?.cards[index]);
    transformDraggingCard(e, boardZoomRef.current);
  }, [boardZoomRef, calculateAllowedMoves, player, transformDraggingCard]);

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
      transformDraggingCard(e, boardZoomRef.current);
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
        onMouseDown={handleBoardMouseDown}
        onMouseMove={handleBoardMouseMove}
        onMouseUp={handleBoardMouseUp}
        onWheel={handleBoardMouseWheel}
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
