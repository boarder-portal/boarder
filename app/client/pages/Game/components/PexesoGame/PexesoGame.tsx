import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import block from 'bem-cn';
import { useRecoilValue } from 'recoil';
import times from 'lodash/times';
import sortBy from 'lodash/sortBy';

import { GAMES_CONFIG } from 'common/constants/gamesConfig';

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
import { EGame, EPlayerStatus } from 'common/types';

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
      width: var(--card-size);
      height: var(--card-size);
      transition: transform var(--animation-duration) ease-out;

      .cardBack, .cardContent {
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        height: 100%;
        border-radius: 8px;
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

    &__empty {
      position: absolute;
      width: 100%;
      height: 100%;
      border: 1px solid black;
      border-radius: 8px;
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

const {
  games: {
    [EGame.PEXESO]: {
      sets,
      fieldOptions,
    },
  },
} = GAMES_CONFIG;

const shuffleCards = (cards: IPexesoClientCard[], shuffleIndexes: IPexesoShuffleCardsIndexes | null) => {
  if (!shuffleIndexes) {
    return;
  }

  const cardsAtIndexes = shuffleIndexes.indexes.map((index) => cards[index]);

  cardsAtIndexes.forEach((card, index) => {
    cards[shuffleIndexes.indexes[shuffleIndexes.permutation[index]]] = card;
  });
};

const getOrthogonalFieldCardCoord = (coord: number): string => (
  `calc((var(--card-size) + var(--cards-margin)) * ${coord})`
);

const getOrthogonalFieldSideSize = (cardsCount: number): string => (
  `calc(var(--card-size) * ${cardsCount} + var(--cards-margin) * ${cardsCount - 1})`
);

const PexesoGame: React.FC<IPexesoGameProps> = (props) => {
  const { io, isGameEnd, players: baseGamePlayers } = props;

  const [options, setOptions] = useState<IPexesoGameOptions | null>(null);
  const [cards, setCards] = useState<IPexesoClientCard[]>([]);
  const [highlightedCardsIndexes, setHighlightedCardsIndexes] = useState<number[]>([]);
  const [players, setPlayers] = useState<IPexesoPlayer[]>([]);
  const imagesRef = useRef<HTMLImageElement[]>([]);

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
    } = sets[options.set];

    times(imagesCount, (id) => {
      times(imageVariantsCount, (variant) => {
        const image = new Image();

        image.src = `/pexeso/sets/${options.set}/${id}/${variant}.jpg`;

        imagesRef.current.push(image);
      });
    });
  }, [options]);

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
  const cardsCoords: { x: string; y: string }[] = [];
  let cssFieldWidth: string;
  let cssFieldHeight: string;

  if (layout === EPexesoFieldLayout.RECT) {
    const {
      width: fieldWidth,
      height: fieldHeight,
    } = fieldOptions[layout][differentCardsCount * matchingCardsCount];

    cssFieldWidth = getOrthogonalFieldSideSize(fieldWidth);
    cssFieldHeight = getOrthogonalFieldSideSize(fieldHeight);

    for (let y = 0; y < fieldHeight; y++) {
      for (let x = 0; x < fieldWidth; x++) {
        cardsCoords.push({
          x: getOrthogonalFieldCardCoord(x),
          y: getOrthogonalFieldCardCoord(y),
        });
      }
    }
  } else {
    const {
      start,
      middle,
    } = fieldOptions[layout][differentCardsCount * matchingCardsCount];
    const rowsCount = 2 * (middle - start) + 1;

    cssFieldWidth = getOrthogonalFieldSideSize(middle);
    cssFieldHeight = getOrthogonalFieldSideSize(rowsCount);

    for (let y = 0; y < rowsCount; y++) {
      const cardsInRow = y > middle - start
        ? 2 * middle - start - y
        : start + y;
      const offsetX = (middle - cardsInRow) / 2;

      for (let x = 0; x < cardsInRow; x++) {
        cardsCoords.push({
          x: getOrthogonalFieldCardCoord(x + offsetX),
          y: getOrthogonalFieldCardCoord(y),
        });
      }
    }
  }

  return (
    <Root className={b()} flex between={20}>
      <Box
        className={b('cardsLayout')}
        width={cssFieldWidth}
        height={cssFieldHeight}
      >
        {sortBy((cards.map((card, cardIndex) => {
          const coords = cardsCoords[cardIndex];

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
                transform: `translate(${coords.x}, ${coords.y})`,
              }}
            >
              {!card.isInGame && <div className={b('empty')} />}

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
      </Box>

      {playersBlock}
    </Root>
  );
};

export default React.memo(PexesoGame);
