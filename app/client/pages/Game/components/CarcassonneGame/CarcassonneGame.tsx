import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import block from 'bem-cn';
import { useRecoilValue } from 'recoil';
import { map } from 'lodash';

import {
  ECarcassonneGameEvent,
  ICarcassonneGameInfoEvent,
  ICarcassonnePlayer,
  TCarcassonneBoard,
  TCarcassonneObjects,
} from 'common/types/carcassonne';
import { ICoords } from 'common/types';

import Box from 'client/components/common/Box/Box';
import GameEnd from 'client/pages/Game/components/GameEnd/GameEnd';

import userAtom from 'client/atoms/userAtom';

interface ICarcassonneGameProps {
  io: SocketIOClient.Socket;
  isGameEnd: boolean;
}

const b = block('CarcassonneGame');

const BASE_CARD_SIZE = 100;

const Root = styled(Box)`
  .CarcassonneGame {
    &__boardWrapper {
      height: calc(100vh - 48px);
      overflow: hidden;
      cursor: pointer;
    }

    &__board {
      transform-origin: 0 0;
    }

    &__card {
      flex-shrink: 0;
      width: ${BASE_CARD_SIZE}px;
      height: ${BASE_CARD_SIZE}px;
      border: 1px solid #ddd;
    }

    &__cardImage {
      width: 100%;
      height: 100%;
      pointer-events: none;
    }
  }
`;

const CarcassonneGame: React.FC<ICarcassonneGameProps> = (props) => {
  const { io, isGameEnd } = props;

  const [players, setPlayers] = useState<ICarcassonnePlayer[]>([]);
  const [board, setBoard] = useState<TCarcassonneBoard>({});
  const [objects, setObjects] = useState<TCarcassonneObjects>({});

  const boardWrapperRef = useRef<HTMLDivElement | null>(null);
  const boardRef = useRef<HTMLDivElement | null>(null);

  const user = useRecoilValue(userAtom);

  const player = useMemo(() => {
    return players.find(({ login }) => login === user?.login);
  }, [players, user]);

  const boardTranslateRef = useRef<ICoords>({ x: 0, y: 0 });
  const boardZoomRef = useRef<number>(1);
  const lastDragPointRef = useRef<ICoords | null>(null);
  const isDraggingRef = useRef<boolean>(false);

  const transformBoard = useCallback(() => {
    if (!boardRef.current || !boardTranslateRef.current) {
      return;
    }

    boardRef.current.style.transform = `
      translate(${boardTranslateRef.current.x}px, ${boardTranslateRef.current.y}px)
      scale(${boardZoomRef.current})
    `;
  }, []);

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

  useEffect(() => {
    if (!boardWrapperRef.current) {
      return;
    }

    boardWrapperRef.current.addEventListener('wheel', (e: WheelEvent) => {
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
    });
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
        </div>
      </div>
    </Root>
  );
};

export default React.memo(CarcassonneGame);
