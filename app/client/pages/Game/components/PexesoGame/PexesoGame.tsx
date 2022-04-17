import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import block from 'bem-cn';
import { useRecoilValue } from 'recoil';
import times from 'lodash/times';
import sortBy from 'lodash/sortBy';

import { FIELD_OPTIONS, SETS } from 'common/constants/games/pexeso';

import {
  EPexesoFieldLayout,
  EPexesoGameEvent,
  IPexesoCard,
  IPexesoGameInfoEvent,
  IPexesoGameOptions,
  IPexesoHideCardsEvent,
  IPexesoPlayer,
  IPexesoRemoveCardsEvent,
  IPexesoShuffleCardsIndexes,
} from 'common/types/pexeso';
import { EPlayerStatus, ICoords } from 'common/types';

import Box from 'client/components/common/Box/Box';
import GameEnd from 'client/pages/Game/components/GameEnd/GameEnd';
import DotSeparator from 'client/components/common/DotSeparator/DotSeparator';

import userAtom from 'client/atoms/userAtom';

interface IPexesoGameProps {
  io: SocketIOClient.Socket;
  players: IPexesoPlayer[];
  isGameEnd: boolean;
}

interface IPexesoClientCard extends IPexesoCard {
  id: number;
  isOpen: boolean;
  opened: boolean;
  closed: boolean;
  exited: boolean;
}

const CARD_SIZE = 80;
const CARDS_MARGIN = 8;

const b = block('PexesoGame');

const Root = styled(Box)`
  --card-size: 80px;
  --cards-margin: 8px;
  --animation-duration: 0.3s;

  .PexesoGame {
    &__cardsLayout {
      position: relative;
    }

    &__card {
      position: absolute;
      top: 0;
      left: 0;
      width: ${CARD_SIZE}px;
      height: ${CARD_SIZE}px;
      transition: transform var(--animation-duration) ease-out;
      border: 1px solid black;
      border-radius: 8px;
      overflow: hidden;

      .cardBack, .cardContent {
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        height: 100%;
        opacity: 1;
        animation: var(--animation-duration) ease-in-out;
      }

      .cardBack {
        width: 100%;
      }

      .cardContent {
        width: 0;
      }

      &_closed {
        .cardBack {
          animation-name: open;
        }

        .cardContent {
          animation-name: close;
        }
      }

      &_opened {
        .cardBack {
          animation-name: close;
        }

        .cardContent {
          animation-name: open;
        }
      }

      &_isOpen {
        .cardBack {
          width: 0;
        }

        .cardContent {
          width: 100%;
        }
      }

      &_isInGame {
        .cardBack {
          cursor: pointer;
        }
      }

      &_isOut {
        background-color: #fff;

        .cardBack, .cardContent {
          opacity: 0;
        }
      }

      &_exited {
        .cardBack, .cardContent {
          animation-name: fade;
        }
      }

      &_isHighlighted {
        &:after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background-color: #f00;
        }
      }
    }

    &__player {
      &_isActive {
        font-weight: bold;
      }
    }
  }

  @keyframes close {
    0% {
      width: 100%;
    }

    50% {
      width: 0;
    }

    100% {
      width: 0;
    }
  }

  @keyframes open {
    0% {
      width: 0;
    }

    50% {
      width: 0;
    }

    100% {
      width: 100%;
    }
  }

  @keyframes fade {
    0% {
      opacity: 1;
    }

    100% {
      opacity: 0;
    }
  }
`;

const shuffleCards = (cards: IPexesoClientCard[], shuffleIndexes: IPexesoShuffleCardsIndexes | null) => {
  if (!shuffleIndexes) {
    return;
  }

  const cardsAtIndexes = shuffleIndexes.indexes.map((index) => cards[index]);

  cardsAtIndexes.forEach((card, index) => {
    cards[shuffleIndexes.indexes[shuffleIndexes.permutation[index]]] = card;
  });
};

const getOrthogonalFieldCardCoord = (coord: number): number => (
  (CARD_SIZE + CARDS_MARGIN) * coord
);

const PexesoGame: React.FC<IPexesoGameProps> = (props) => {
  const { io, isGameEnd, players: baseGamePlayers } = props;

  const [options, setOptions] = useState<IPexesoGameOptions | null>(null);
  const [cards, setCards] = useState<IPexesoClientCard[]>([]);
  const [highlightedCardsIndexes, setHighlightedCardsIndexes] = useState<number[]>([]);
  const [players, setPlayers] = useState<IPexesoPlayer[]>([]);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const cardsLayoutContainerRef = useRef<HTMLDivElement | null>(null);
  const cardsLayoutRef = useRef<HTMLDivElement | null>(null);

  const user = useRecoilValue(userAtom);

  const player = useMemo(() => {
    return players.find(({ login }) => login === user?.login);
  }, [players, user]);

  const handleCardClick = useCallback((cardIndex: number) => {
    if (!player?.isActive) {
      return;
    }

    setHighlightedCardsIndexes([]);

    io.emit(EPexesoGameEvent.OPEN_CARD, cardIndex);
  }, [io, player]);

  const handleCardRightClick = useCallback((e: React.MouseEvent, cardIndex: number) => {
    e.preventDefault();

    const highlightedIndex = highlightedCardsIndexes.indexOf(cardIndex);

    if (highlightedIndex === -1) {
      setHighlightedCardsIndexes([
        ...highlightedCardsIndexes,
        cardIndex,
      ]);
    } else {
      setHighlightedCardsIndexes([
        ...highlightedCardsIndexes.slice(0, highlightedIndex),
        ...highlightedCardsIndexes.slice(highlightedIndex + 1),
      ]);
    }
  }, [highlightedCardsIndexes]);

  useEffect(() => {
    io.emit(EPexesoGameEvent.GET_GAME_INFO);

    io.on(EPexesoGameEvent.GAME_INFO, ({
      options,
      cards,
      players,
      openedCardsIndexes,
    }: IPexesoGameInfoEvent) => {
      setOptions(options);
      setCards(cards.map((card, index) => ({
        ...card,
        id: index,
        isOpen: openedCardsIndexes.includes(index),
        opened: false,
        closed: false,
        exited: false,
      })));
      setPlayers(players);
    });

    io.on(EPexesoGameEvent.OPEN_CARD, (cardIndex: number) => {
      setCards((cards) => {
        cards[cardIndex].closed = false;
        cards[cardIndex].opened = true;
        cards[cardIndex].isOpen = true;

        return [...cards];
      });
    });

    io.on(EPexesoGameEvent.HIDE_CARDS, ({ indexes, shuffleIndexes }: IPexesoHideCardsEvent) => {
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

    io.on(EPexesoGameEvent.REMOVE_CARDS, ({ indexes, shuffleIndexes }: IPexesoRemoveCardsEvent) => {
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

    io.on(EPexesoGameEvent.UPDATE_PLAYERS, (players: IPexesoPlayer[]) => {
      setPlayers(players);
    });

    return () => {
      io.off(EPexesoGameEvent.GAME_INFO);
      io.off(EPexesoGameEvent.OPEN_CARD);
      io.off(EPexesoGameEvent.HIDE_CARDS);
      io.off(EPexesoGameEvent.REMOVE_CARDS);
      io.off(EPexesoGameEvent.UPDATE_PLAYERS);
    };
  }, [io]);

  useEffect(() => {
    setPlayers(baseGamePlayers);
  }, [baseGamePlayers]);

  useEffect(() => {
    if (!options) {
      return;
    }

    const {
      imagesCount,
      imageVariantsCount,
    } = SETS[options.set];

    times(imagesCount, (id) => {
      times(imageVariantsCount, (variant) => {
        const image = new Image();

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

    for (const card of cardsLayout.querySelectorAll(`.${b('card')}`)) {
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
            className={b('player', { isActive: localPlayer.isActive })}
            flex
            alignItems="center"
          >
            <span>{`${localPlayer.login} ${localPlayer.score}`}</span>

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
  }, [players]);

  if (isGameEnd) {
    return (
      <GameEnd>{playersBlock}</GameEnd>
    );
  }

  if (!cards.length || !options) {
    return null;
  }

  const {
    set,
    differentCardsCount,
    matchingCardsCount,
    layout,
  } = options;
  const cardsOptions: (ICoords & { angle?: number })[] = [];

  if (layout === EPexesoFieldLayout.RECT) {
    const {
      width: fieldWidth,
      height: fieldHeight,
    } = FIELD_OPTIONS[layout][differentCardsCount * matchingCardsCount];

    for (let y = 0; y < fieldHeight; y++) {
      for (let x = 0; x < fieldWidth; x++) {
        cardsOptions.push({
          x: getOrthogonalFieldCardCoord(x),
          y: getOrthogonalFieldCardCoord(y),
        });
      }
    }
  } else if (layout === EPexesoFieldLayout.HEX) {
    const {
      start,
      middle,
    } = FIELD_OPTIONS[layout][differentCardsCount * matchingCardsCount];
    const rowsCount = 2 * (middle - start) + 1;

    for (let y = 0; y < rowsCount; y++) {
      const cardsInRow = y > middle - start
        ? 2 * middle - start - y
        : start + y;
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
      const radius = CARD_SIZE * (0.5 + (layout === EPexesoFieldLayout.SPIRAL ? 0.21 : 0.19) * (angle - startingAngle));

      cardsOptions.push({
        x: radius * Math.cos(angle),
        y: radius * Math.sin(angle),
        angle: layout === EPexesoFieldLayout.SPIRAL_ROTATE ? angle + Math.PI / 2 : undefined,
      });

      angle += (CARD_SIZE / radius) * Math.PI / 4;
    }
  }

  return (
    <Root className={b()} flex between={20}>
      <div
        ref={cardsLayoutContainerRef}
        className={b('cardsLayoutContainer')}
      >
        <div
          ref={cardsLayoutRef}
          className={b('cardsLayout')}
        >
          {sortBy((cards.map((card, cardIndex) => {
            const { x, y, angle } = cardsOptions[cardIndex];

            return (
              <div
                key={card.id}
                id={`card-${card.id}`}
                className={b('card', {
                  isHighlighted: highlightedCardsIndexes.includes(cardIndex),
                  isOpen: card.isOpen,
                  opened: card.opened,
                  closed: card.closed,
                  exited: card.exited,
                  isInGame: card.isInGame,
                  isOut: !card.isInGame,
                })}
                style={{
                  transform: `translate(${x}px, ${y}px)${angle === undefined ? '' : `rotate(${angle}rad)`}`,
                  zIndex: card.isInGame ? cardIndex : cardIndex - 1e4,
                }}
              >
                <img
                  className="cardBack"
                  alt="card"
                  src={'/pexeso/backs/default/2.jpg'}
                  onClick={() => handleCardClick(cardIndex)}
                  onContextMenu={(e) => handleCardRightClick(e, cardIndex)}
                />

                <img
                  className="cardContent"
                  alt="back"
                  src={`/pexeso/sets/${set}/${card.imageId}/${card.imageVariant}.jpg`}
                />
              </div>
            );
          })), 'props.id')}
        </div>
      </div>

      {playersBlock}
    </Root>
  );
};

export default React.memo(PexesoGame);
