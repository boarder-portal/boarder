import { MouseEvent, MutableRefObject, WheelEvent, useCallback, useEffect, useRef, useState } from 'react';

import { BASE_CARD_SIZE } from 'client/components/games/carcassonne/CarcassonneGame/components/GameContent/constants';

import { Coords } from 'common/types';

interface UseBoardControlOptions {
  onZoom(e: WheelEvent, zoom: number): void;
}

interface UseBoardControl {
  boardWrapperRef: MutableRefObject<HTMLDivElement | null>;
  boardRef: MutableRefObject<HTMLDivElement | null>;
  zoomRef: MutableRefObject<number>;
  isAbleToPlaceCard: boolean;

  handleMouseDown(e: MouseEvent): void;
  handleMouseUp(e: MouseEvent): void;
  handleMouseMove(e: MouseEvent): void;
  handleMouseWheel(e: WheelEvent): void;
}

export default function useBoardControl(options: UseBoardControlOptions): UseBoardControl {
  const { onZoom } = options;

  const [isAbleToPlaceCard, setIsInteractable] = useState(true);

  const boardWrapperRef = useRef<HTMLDivElement | null>(null);
  const boardRef = useRef<HTMLDivElement | null>(null);

  const translateRef = useRef<Coords>({ x: 0, y: 0 });
  const zoomRef = useRef<number>(1);

  const lastDragPointRef = useRef<Coords | null>(null);
  const isDraggingRef = useRef<boolean>(false);

  const transformBoard = useCallback(() => {
    if (!boardRef.current || !translateRef.current) {
      return;
    }

    boardRef.current.style.transform = `
      translate(${translateRef.current.x}px, ${translateRef.current.y}px)
      scale(${zoomRef.current})
    `;
  }, []);

  const handleMouseDown = useCallback((e: MouseEvent) => {
    isDraggingRef.current = true;
    lastDragPointRef.current = {
      x: e.clientX,
      y: e.clientY,
    };
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDraggingRef.current || !lastDragPointRef.current || !boardRef.current) {
        return;
      }

      const dx = e.clientX - lastDragPointRef.current.x;
      const dy = e.clientY - lastDragPointRef.current.y;

      const currentTranslateX = translateRef.current.x + dx;
      const currentTranslateY = translateRef.current.y + dy;

      translateRef.current = {
        x: currentTranslateX,
        y: currentTranslateY,
      };

      lastDragPointRef.current = {
        x: e.clientX,
        y: e.clientY,
      };

      transformBoard();
      setIsInteractable(false);
    },
    [transformBoard],
  );

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
    lastDragPointRef.current = null;

    setTimeout(() => setIsInteractable(true), 200);
  }, []);

  const handleMouseWheel = useCallback(
    (e: WheelEvent) => {
      if (!boardWrapperRef.current || !translateRef.current) {
        return;
      }

      const viewPortHeight = boardWrapperRef.current.offsetHeight;
      const viewPortWidth = boardWrapperRef.current.offsetWidth;

      const oldZoom = zoomRef.current;
      const newZoom = oldZoom * (1 - 0.1 * Math.sign(e.deltaY));

      const newTransformY = viewPortHeight / 2 - ((viewPortHeight / 2 - translateRef.current.y) * newZoom) / oldZoom;
      const newTransformX = viewPortWidth / 2 - ((viewPortWidth / 2 - translateRef.current.x) * newZoom) / oldZoom;

      zoomRef.current = newZoom;
      translateRef.current = {
        x: newTransformX,
        y: newTransformY,
      };

      transformBoard();
      onZoom(e, zoomRef.current);
    },
    [onZoom, transformBoard],
  );

  useEffect(() => {
    if (!boardWrapperRef.current || !boardRef.current) {
      return;
    }

    const dy = Math.round((boardWrapperRef.current.offsetHeight - BASE_CARD_SIZE) / 2);
    const dx = Math.round((boardWrapperRef.current.offsetWidth - BASE_CARD_SIZE) / 2);

    translateRef.current = { x: dx, y: dy };

    transformBoard();
  }, [transformBoard]);

  return {
    boardWrapperRef,
    boardRef,

    zoomRef,
    isAbleToPlaceCard,

    handleMouseDown,
    handleMouseUp,
    handleMouseMove,
    handleMouseWheel,
  };
}
