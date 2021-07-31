import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import block from 'bem-cn';
import { useRecoilValue } from 'recoil';

import { GAMES_CONFIG } from 'common/constants/gamesConfig';

import { EGame } from 'common/types/game';
import {
  ECarcassoneGameEvent,
  ICarcassoneGameInfoEvent,
  ICarcassonePlayer,
  ICarcassoneTile,
} from 'common/types/carcassone';
import { ICoords } from 'common/types';

import Box from 'client/components/common/Box/Box';
import GameEnd from 'client/pages/Game/components/GameEnd/GameEnd';

import userAtom from 'client/atoms/userAtom';

interface ICarcassoneGameProps {
  io: SocketIOClient.Socket;
  isGameEnd: boolean;
}

const b = block('CarcassoneGame');

const BASE_CARD_SIZE = 100;

const Root = styled(Box)`
  .CarcassoneGame {
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

const {
  games: {
    [EGame.CARCASSONE]: {
      board: {
        size: BOARD_SIZE,
      },
    },
  },
} = GAMES_CONFIG;

const CarcassoneGame: React.FC<ICarcassoneGameProps> = (props) => {
  const { io, isGameEnd } = props;

  const [players, setPlayers] = useState<ICarcassonePlayer[]>([]);
  const [board, setBoard] = useState<ICarcassoneTile[][]>([]);

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

    boardRef.current.style.transform = `translate(${boardTranslateRef.current.x}px, ${boardTranslateRef.current.y}px) scale(${boardZoomRef.current})`;
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
    io.emit(ECarcassoneGameEvent.GET_GAME_INFO);

    io.on(ECarcassoneGameEvent.GAME_INFO, (gameInfo: ICarcassoneGameInfoEvent) => {
      if (!user) {
        return;
      }

      console.log(ECarcassoneGameEvent.GAME_INFO, gameInfo);

      setPlayers(gameInfo.players);
      setBoard(gameInfo.board);
    });

    return () => {
      io.off(ECarcassoneGameEvent.GAME_INFO);
    };
  }, [io, user]);

  useEffect(() => {
    if (!boardWrapperRef.current || !boardRef.current) {
      return;
    }

    const dy = Math.round((BOARD_SIZE.y * BASE_CARD_SIZE - boardWrapperRef.current.offsetHeight) / 2);
    const dx = Math.round((BOARD_SIZE.x * BASE_CARD_SIZE - boardWrapperRef.current.offsetWidth) / 2);

    boardTranslateRef.current = { x: -dx, y: -dy };

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

      const newTransformY = (((Math.abs(boardTranslateRef.current.y) + viewPortHeight / 2)) * newZoom / oldZoom - viewPortHeight / 2) * -1;

      const newTransformX = (((Math.abs(boardTranslateRef.current.x) + viewPortWidth / 2)) * newZoom / oldZoom - viewPortWidth / 2) * -1;

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
          {board.map((tiles, y) => {
            return (
              <Box key={y} flex>
                {tiles.map((tile, x) => (
                  <div className={b('card')} key={x}>
                    {tile.card && (
                      <img className={b('cardImage')} src={`/carcassone/tiles/${tile.card.id}.jpg`} />
                    )}
                  </div>
                ))}
              </Box>
            );
          })}
        </div>
      </div>
    </Root>
  );
};

export default React.memo(CarcassoneGame);
