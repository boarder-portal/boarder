import classNames from 'classnames';
import sortBy from 'lodash/sortBy';
import times from 'lodash/times';
import { FC, MouseEvent, memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { CARD_ANIMATION_DURATION, FIELD_OPTIONS, SETS } from 'common/constants/games/pexeso';

import { Coords } from 'common/types';
import { GameType } from 'common/types/game';
import {
  Card,
  FieldLayoutType,
  GameClientEventType,
  GameServerEventType,
  Player,
  ShuffleCardsIndexes,
} from 'common/types/games/pexeso';

import usePlayer from 'client/hooks/usePlayer';
import useSocket from 'client/hooks/useSocket';

import Flex from 'client/components/common/Flex/Flex';
import Image from 'client/components/common/Image/Image';
import { GameContentProps } from 'client/components/game/Game/Game';
import GameEnd from 'client/components/game/Game/components/GameEnd/GameEnd';

import styles from './GameContent.module.scss';

interface PexesoClientCard extends Card {
  id: number;
  isOpen: boolean;
  opened: boolean;
  closed: boolean;
  exited: boolean;
}

const CARD_SIZE = 80;
const CARDS_MARGIN = 8;

const shuffleCards = (cards: PexesoClientCard[], shuffleIndexes: ShuffleCardsIndexes | null) => {
  if (!shuffleIndexes) {
    return;
  }

  const cardsAtIndexes = shuffleIndexes.indexes.map((index) => cards[index]);

  cardsAtIndexes.forEach((card, index) => {
    cards[shuffleIndexes.indexes[shuffleIndexes.permutation[index]]] = card;
  });
};

const getOrthogonalFieldCardCoord = (coord: number): number => (CARD_SIZE + CARDS_MARGIN) * coord;

const GameContent: FC<GameContentProps<GameType.PEXESO>> = (props) => {
  const { io, gameOptions, gameInfo, gameResult } = props;

  const [cards, setCards] = useState<PexesoClientCard[]>(
    gameInfo.cards.map((card, index) => ({
      ...card,
      id: index,
      isOpen: gameInfo.turn?.openedCardsIndexes.includes(index) ?? false,
      opened: false,
      closed: false,
      exited: false,
    })),
  );
  const [highlightedCardsIndexes, setHighlightedCardsIndexes] = useState<number[]>([]);
  const [players, setPlayers] = useState<Player[]>(gameInfo.players);
  const [activePlayerIndex, setActivePlayerIndex] = useState(gameInfo.activePlayerIndex);

  const imagesRef = useRef<HTMLImageElement[]>([]);
  const cardsLayoutContainerRef = useRef<HTMLDivElement | null>(null);
  const cardsLayoutRef = useRef<HTMLDivElement | null>(null);

  const player = usePlayer(players);

  useSocket(io, {
    [GameServerEventType.OPEN_CARD]: (cardIndex) => {
      setCards((cards) => {
        cards[cardIndex].closed = false;
        cards[cardIndex].opened = true;
        cards[cardIndex].isOpen = true;

        return [...cards];
      });
    },
    [GameServerEventType.HIDE_CARDS]: ({ indexes, shuffleIndexes }) => {
      setCards((cards) => {
        indexes.forEach((cardIndex) => {
          cards[cardIndex].isOpen = false;
          cards[cardIndex].opened = false;
          cards[cardIndex].closed = true;
        });
        shuffleCards(cards, shuffleIndexes);

        return cards;
      });
      setHighlightedCardsIndexes([]);
    },
    [GameServerEventType.REMOVE_CARDS]: ({ indexes, shuffleIndexes }) => {
      setCards((cards) => {
        indexes.forEach((cardIndex) => {
          cards[cardIndex].isInGame = false;
          cards[cardIndex].exited = true;
        });
        shuffleCards(cards, shuffleIndexes);

        return cards;
      });
      setHighlightedCardsIndexes([]);
    },
    [GameServerEventType.UPDATE_PLAYERS]: ({ players, activePlayerIndex }) => {
      setPlayers(players);
      setActivePlayerIndex(activePlayerIndex);
    },
  });

  const handleCardClick = useCallback(
    (cardIndex: number) => {
      if (player?.index !== activePlayerIndex) {
        return;
      }

      setHighlightedCardsIndexes([]);

      io.emit(GameClientEventType.OPEN_CARD, cardIndex);
    },
    [activePlayerIndex, io, player],
  );

  const handleCardRightClick = useCallback((e: MouseEvent, cardIndex: number) => {
    e.preventDefault();

    setHighlightedCardsIndexes((highlightedCardsIndexes) => {
      const highlightedIndex = highlightedCardsIndexes.indexOf(cardIndex);

      return highlightedIndex === -1
        ? [...highlightedCardsIndexes, cardIndex]
        : highlightedCardsIndexes.toSpliced(highlightedIndex, 1);
    });
  }, []);

  useEffect(() => {
    const { imagesCount, imageVariantsCount } = SETS[gameOptions.set];

    times(imagesCount, (id) => {
      times(imageVariantsCount, (variant) => {
        const image = new window.Image();

        image.src = `/pexeso/sets/${gameOptions.set}/${id}/${variant}.jpg`;

        imagesRef.current.push(image);
      });
    });
  }, [gameOptions]);

  useLayoutEffect(() => {
    const cardsLayoutContainer = cardsLayoutContainerRef.current;
    const cardsLayout = cardsLayoutRef.current;

    if (!cardsLayoutContainer || !cardsLayout) {
      return;
    }

    const cardsLayoutBox = cardsLayout.getBoundingClientRect();
    let minLeft = Infinity;
    let maxRight = -Infinity;
    let minTop = Infinity;
    let maxBottom = -Infinity;

    for (const card of cardsLayout.querySelectorAll(`.${styles.card}`)) {
      const box = card.getBoundingClientRect();

      minLeft = Math.min(minLeft, box.left);
      maxRight = Math.max(maxRight, box.right);
      minTop = Math.min(minTop, box.top);
      maxBottom = Math.max(maxBottom, box.bottom);
    }

    cardsLayoutContainer.style.width = `${maxRight - minLeft}px`;
    cardsLayoutContainer.style.height = `${maxBottom - minTop}px`;

    cardsLayout.style.transform = `translate(
      ${cardsLayoutBox.left - minLeft}px,
      ${cardsLayoutBox.top - minTop}px
    )`;
  }, [cards.length]);

  const playersBlock = useMemo(() => {
    return (
      <Flex direction="column" between={2}>
        {players.map((localPlayer) => (
          <Flex
            key={localPlayer.login}
            className={classNames(styles.player, {
              [styles.isActive]: localPlayer.index === activePlayerIndex,
            })}
            alignItems="center"
          >
            <span>{`${localPlayer.name} ${localPlayer.data.score}`}</span>
          </Flex>
        ))}
      </Flex>
    );
  }, [activePlayerIndex, players]);

  if (gameResult) {
    return <GameEnd>{playersBlock}</GameEnd>;
  }

  if (!cards.length) {
    return null;
  }

  const { set, differentCardsCount, matchingCardsCount, layout } = gameOptions;
  const cardsOptions: (Coords & { angle?: number })[] = [];

  if (layout === FieldLayoutType.RECT) {
    const { width: fieldWidth, height: fieldHeight } = FIELD_OPTIONS[layout][differentCardsCount * matchingCardsCount];

    for (let y = 0; y < fieldHeight; y++) {
      for (let x = 0; x < fieldWidth; x++) {
        cardsOptions.push({
          x: getOrthogonalFieldCardCoord(x),
          y: getOrthogonalFieldCardCoord(y),
        });
      }
    }
  } else if (layout === FieldLayoutType.HEX) {
    const { start, middle } = FIELD_OPTIONS[layout][differentCardsCount * matchingCardsCount];
    const rowsCount = 2 * (middle - start) + 1;

    for (let y = 0; y < rowsCount; y++) {
      const cardsInRow = y > middle - start ? 2 * middle - start - y : start + y;
      const offsetX = (middle - cardsInRow) / 2;

      for (let x = 0; x < cardsInRow; x++) {
        cardsOptions.push({
          x: getOrthogonalFieldCardCoord(x + offsetX),
          y: getOrthogonalFieldCardCoord(y),
        });
      }
    }
  } else {
    const cardsCount = gameOptions.differentCardsCount * gameOptions.matchingCardsCount;
    const startingAngle = -Math.PI / 2;
    let angle = startingAngle;

    for (let i = 0; i < cardsCount; i++) {
      const radius = CARD_SIZE * (0.5 + (layout === FieldLayoutType.SPIRAL ? 0.21 : 0.19) * (angle - startingAngle));

      cardsOptions.push({
        x: radius * Math.cos(angle),
        y: radius * Math.sin(angle),
        angle: layout === FieldLayoutType.SPIRAL_ROTATE ? angle + Math.PI / 2 : undefined,
      });

      angle += ((CARD_SIZE / radius) * Math.PI) / 4;
    }
  }

  return (
    <Flex
      className={styles.root}
      between={5}
      style={{
        '--animation-duration': `${CARD_ANIMATION_DURATION}ms`,
      }}
    >
      <div ref={cardsLayoutContainerRef}>
        <div ref={cardsLayoutRef} className={styles.cardsLayout}>
          {sortBy(
            cards.map((card, cardIndex) => {
              const { x, y, angle } = cardsOptions[cardIndex];

              return (
                <div
                  key={card.id}
                  id={`card-${card.id}`}
                  className={classNames(styles.card, {
                    [styles.isHighlighted]: highlightedCardsIndexes.includes(cardIndex),
                    [styles.isOpen]: card.isOpen,
                    [styles.opened]: card.opened,
                    [styles.closed]: card.closed,
                    [styles.exited]: card.exited,
                    [styles.isInGame]: card.isInGame,
                    [styles.isOut]: !card.isInGame,
                  })}
                  style={{
                    transform: `translate(${x}px, ${y}px)${angle === undefined ? '' : `rotate(${angle}rad)`}`,
                    zIndex: card.isInGame ? cardIndex : cardIndex - 1e4,
                  }}
                >
                  <Image
                    className={styles.cardBack}
                    alt="card"
                    src={'/pexeso/backs/default/2.jpg'}
                    onClick={() => handleCardClick(cardIndex)}
                    onContextMenu={(e) => handleCardRightClick(e, cardIndex)}
                  />

                  <Image
                    className={styles.cardContent}
                    alt="back"
                    src={`/pexeso/sets/${set}/${card.imageId}/${card.imageVariant}.jpg`}
                  />
                </div>
              );
            }),
            'props.id',
          )}
        </div>
      </div>

      {playersBlock}
    </Flex>
  );
};

export default memo(GameContent);