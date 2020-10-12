import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import block from 'bem-cn';
import { useRecoilValue } from 'recoil';
import times from 'lodash/times';
import chunk from 'lodash/chunk';

import { GAMES_CONFIG } from 'common/constants/gamesConfig';

import {
  EPexesoGameEvent,
  IPexesoCard,
  IPexesoGameInfoEvent,
  IPexesoGameOptions,
  IPexesoPlayer,
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

interface IPexesoAnimatedCard extends IPexesoCard {
  opened: boolean;
  closed: boolean;
  exited: boolean;
}

const b = block('PexesoGame');

const Root = styled(Box)`
  .PexesoGame {
    &__card {
      position: relative;
      width: 80px;
      height: 80px;

      .cardBack, .cardContent {
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        height: 100%;
        border-radius: 8px;
        opacity: 1;
        animation: 0.3s ease-in-out;
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

      &_highlighted {
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
      fieldSizes,
    },
  },
} = GAMES_CONFIG;

const PexesoGame: React.FC<IPexesoGameProps> = (props) => {
  const { io, isGameEnd, players: baseGamePlayers } = props;

  const [options, setOptions] = useState<IPexesoGameOptions | null>(null);
  const [cards, setCards] = useState<IPexesoAnimatedCard[]>([]);
  const [openedCardsIndexes, setOpenedCardsIndexes] = useState<number[]>([]);
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
      setCards(cards.map((card) => ({
        ...card,
        opened: false,
        closed: false,
        exited: false,
      })));
      setOpenedCardsIndexes(openedCardsIndexes);
      setPlayers(players);
    });

    io.on(EPexesoGameEvent.OPEN_CARD, (cardIndex: number) => {
      setCards((cards) => {
        cards[cardIndex].closed = false;
        cards[cardIndex].opened = true;

        return cards;
      });
      setOpenedCardsIndexes((prevOpenedCards) => [...prevOpenedCards, cardIndex]);
    });

    io.on(EPexesoGameEvent.HIDE_CARDS, (hiddenCardsIndexes: number[]) => {
      setCards((cards) => {
        hiddenCardsIndexes.forEach((cardIndex) => {
          cards[cardIndex].opened = false;
          cards[cardIndex].closed = true;
        });

        return cards;
      });
      setOpenedCardsIndexes([]);
      setHighlightedCardsIndexes([]);
    });

    io.on(EPexesoGameEvent.REMOVE_CARDS, (removedCardsIndexes: number[]) => {
      setCards((cards) => {
        removedCardsIndexes.forEach((cardIndex) => {
          cards[cardIndex].isInGame = false;
          cards[cardIndex].exited = true;
        });

        return cards;
      });
      setHighlightedCardsIndexes([]);
    });

    io.on(EPexesoGameEvent.UPDATE_PLAYERS, (players: IPexesoPlayer[]) => {
      setPlayers(players);
    });
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
  } = options;
  const {
    width: fieldWidth,
  } = fieldSizes[differentCardsCount * matchingCardsCount];

  return (
    <Root className={b()} flex between={20}>
      <Box between={8}>
        {chunk(cards, fieldWidth).map((row, y) => (
          <Box key={y} flex between={8}>
            {row.map((card, x) => {
              const cardIndex = y * fieldWidth + x;

              return (
                <div
                  key={x}
                  className={b('card', {
                    highlighted: highlightedCardsIndexes.includes(cardIndex),
                    isOpen: openedCardsIndexes.includes(cardIndex),
                    opened: card.opened,
                    closed: card.closed,
                    exited: card.exited,
                    isInGame: card.isInGame,
                    isOut: !card.isInGame,
                  })}
                >
                  {!card.isInGame && <div key={x} className={b('empty')} />}

                  <img
                    className="cardBack"
                    src={'/pexeso/backs/default/2.jpg'}
                    onClick={() => handleCardClick(cardIndex)}
                    onContextMenu={(e) => handleCardRightClick(e, cardIndex)}
                  />

                  <img
                    className="cardContent"
                    src={`/pexeso/sets/${set}/${card.imageId}/${card.imageVariant}.jpg`}
                  />
                </div>
              );
            })}
          </Box>
        ))}
      </Box>

      {playersBlock}
    </Root>
  );
};

export default React.memo(PexesoGame);
