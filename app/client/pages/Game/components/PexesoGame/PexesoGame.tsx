import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useRecoilValue } from 'recoil';
import times from 'lodash/times';
import sortBy from 'lodash/sortBy';
import classNames from 'classnames';

import { FIELD_OPTIONS, SETS } from 'common/constants/games/pexeso';

import {
  EFieldLayout,
  EGameEvent,
  ICard,
  IGame,
  IGameOptions,
  IHideCardsEvent,
  IPlayer,
  IRemoveCardsEvent,
  IShuffleCardsIndexes,
  IUpdatePlayersEvent,
} from 'common/types/pexeso';
import { EPlayerStatus, ICoords } from 'common/types';
import { EGame } from 'common/types/game';

import Box from 'client/components/common/Box/Box';
import GameEnd from 'client/pages/Game/components/GameEnd/GameEnd';
import DotSeparator from 'client/components/common/DotSeparator/DotSeparator';
import Image from 'client/components/common/Image/Image';

import userAtom from 'client/atoms/userAtom';
import { IGameProps } from 'client/pages/Game/Game';

import styles from './PexesoGame.pcss';

interface IPexesoGameProps extends IGameProps<EGame.PEXESO> {}

interface IPexesoClientCard extends ICard {
  id: number;
  isOpen: boolean;
  opened: boolean;
  closed: boolean;
  exited: boolean;
}

const CARD_SIZE = 80;
const CARDS_MARGIN = 8;

const shuffleCards = (cards: IPexesoClientCard[], shuffleIndexes: IShuffleCardsIndexes | null) => {
  if (!shuffleIndexes) {
    return;
  }

  const cardsAtIndexes = shuffleIndexes.indexes.map((index) => cards[index]);

  cardsAtIndexes.forEach((card, index) => {
    cards[shuffleIndexes.indexes[shuffleIndexes.permutation[index]]] = card;
  });
};

const getOrthogonalFieldCardCoord = (coord: number): number => (CARD_SIZE + CARDS_MARGIN) * coord;

const PexesoGame: React.FC<IPexesoGameProps> = (props) => {
  const { io, isGameEnd } = props;

  const [options, setOptions] = useState<IGameOptions | null>(null);
  const [cards, setCards] = useState<IPexesoClientCard[]>([]);
  const [highlightedCardsIndexes, setHighlightedCardsIndexes] = useState<number[]>([]);
  const [players, setPlayers] = useState<IPlayer[]>([]);
  const [activePlayerIndex, setActivePlayerIndex] = useState(-1);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const cardsLayoutContainerRef = useRef<HTMLDivElement | null>(null);
  const cardsLayoutRef = useRef<HTMLDivElement | null>(null);

  const user = useRecoilValue(userAtom);

  const player = useMemo(() => {
    return players.find(({ login }) => login === user?.login);
  }, [players, user]);

  const handleCardClick = useCallback(
    (cardIndex: number) => {
      if (player?.index !== activePlayerIndex) {
        return;
      }

      setHighlightedCardsIndexes([]);

      io.emit(EGameEvent.OPEN_CARD, cardIndex);
    },
    [activePlayerIndex, io, player],
  );

  const handleCardRightClick = useCallback(
    (e: React.MouseEvent, cardIndex: number) => {
      e.preventDefault();

      const highlightedIndex = highlightedCardsIndexes.indexOf(cardIndex);

      if (highlightedIndex === -1) {
        setHighlightedCardsIndexes([...highlightedCardsIndexes, cardIndex]);
      } else {
        setHighlightedCardsIndexes([
          ...highlightedCardsIndexes.slice(0, highlightedIndex),
          ...highlightedCardsIndexes.slice(highlightedIndex + 1),
        ]);
      }
    },
    [highlightedCardsIndexes],
  );

  useEffect(() => {
    io.emit(EGameEvent.GET_GAME_INFO);

    io.on(EGameEvent.GAME_INFO, ({ options, cards, players, activePlayerIndex, turn }: IGame) => {
      setOptions(options);
      setCards(
        cards.map((card, index) => ({
          ...card,
          id: index,
          isOpen: turn?.openedCardsIndexes.includes(index) ?? false,
          opened: false,
          closed: false,
          exited: false,
        })),
      );
      setPlayers(players);
      setActivePlayerIndex(activePlayerIndex);
    });

    io.on(EGameEvent.OPEN_CARD, (cardIndex: number) => {
      setCards((cards) => {
        cards[cardIndex].closed = false;
        cards[cardIndex].opened = true;
        cards[cardIndex].isOpen = true;

        return [...cards];
      });
    });

    io.on(EGameEvent.HIDE_CARDS, ({ indexes, shuffleIndexes }: IHideCardsEvent) => {
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
    });

    io.on(EGameEvent.REMOVE_CARDS, ({ indexes, shuffleIndexes }: IRemoveCardsEvent) => {
      setCards((cards) => {
        indexes.forEach((cardIndex) => {
          cards[cardIndex].isInGame = false;
          cards[cardIndex].exited = true;
        });
        shuffleCards(cards, shuffleIndexes);

        return cards;
      });
      setHighlightedCardsIndexes([]);
    });

    io.on(EGameEvent.UPDATE_PLAYERS, ({ players, activePlayerIndex }: IUpdatePlayersEvent) => {
      setPlayers(players);
      setActivePlayerIndex(activePlayerIndex);
    });

    return () => {
      io.off(EGameEvent.GAME_INFO);
      io.off(EGameEvent.OPEN_CARD);
      io.off(EGameEvent.HIDE_CARDS);
      io.off(EGameEvent.REMOVE_CARDS);
      io.off(EGameEvent.UPDATE_PLAYERS);
    };
  }, [io]);

  useEffect(() => {
    if (!options) {
      return;
    }

    const { imagesCount, imageVariantsCount } = SETS[options.set];

    times(imagesCount, (id) => {
      times(imageVariantsCount, (variant) => {
        const image = new window.Image();

        image.src = `/pexeso/sets/${options.set}/${id}/${variant}.jpg`;

        imagesRef.current.push(image);
      });
    });
  }, [options]);

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
      <Box between={8}>
        {players.map((localPlayer) => (
          <Box
            key={localPlayer.login}
            className={classNames(styles.player, {
              [styles.isActive]: localPlayer.index === activePlayerIndex,
            })}
            flex
            alignItems="center"
          >
            <span>{`${localPlayer.login} ${localPlayer.data.score}`}</span>

            {localPlayer.status === EPlayerStatus.DISCONNECTED && (
              <>
                <DotSeparator />

                <span>отключен</span>
              </>
            )}
          </Box>
        ))}
      </Box>
    );
  }, [activePlayerIndex, players]);

  if (isGameEnd) {
    return <GameEnd>{playersBlock}</GameEnd>;
  }

  if (!cards.length || !options) {
    return null;
  }

  const { set, differentCardsCount, matchingCardsCount, layout } = options;
  const cardsOptions: (ICoords & { angle?: number })[] = [];

  if (layout === EFieldLayout.RECT) {
    const { width: fieldWidth, height: fieldHeight } = FIELD_OPTIONS[layout][differentCardsCount * matchingCardsCount];

    for (let y = 0; y < fieldHeight; y++) {
      for (let x = 0; x < fieldWidth; x++) {
        cardsOptions.push({
          x: getOrthogonalFieldCardCoord(x),
          y: getOrthogonalFieldCardCoord(y),
        });
      }
    }
  } else if (layout === EFieldLayout.HEX) {
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
    const cardsCount = options.differentCardsCount * options.matchingCardsCount;
    const startingAngle = -Math.PI / 2;
    let angle = startingAngle;

    for (let i = 0; i < cardsCount; i++) {
      const radius = CARD_SIZE * (0.5 + (layout === EFieldLayout.SPIRAL ? 0.21 : 0.19) * (angle - startingAngle));

      cardsOptions.push({
        x: radius * Math.cos(angle),
        y: radius * Math.sin(angle),
        angle: layout === EFieldLayout.SPIRAL_ROTATE ? angle + Math.PI / 2 : undefined,
      });

      angle += ((CARD_SIZE / radius) * Math.PI) / 4;
    }
  }

  return (
    <Box className={styles.root} flex between={20}>
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
    </Box>
  );
};

export default React.memo(PexesoGame);
