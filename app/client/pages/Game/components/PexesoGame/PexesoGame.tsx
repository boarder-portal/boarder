import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import block from 'bem-cn';
import { useRecoilValue } from 'recoil';
import times from 'lodash/times';

import { GAMES_CONFIG } from 'common/constants/gamesConfig';

import { EGameEvent } from 'common/types/game';
import {
  EPexesoGameEvent,
  IPexesoCard,
  IPexesoCardCoords,
  IPexesoGameInfoEvent,
  IPexesoGameOptions,
  IPexesoPlayer,
} from 'common/types/pexeso';
import { EGame, EPlayerStatus } from 'common/types';

import Img from 'client/components/common/Img/Img';
import Box from 'client/components/common/Box/Box';
import GameEnd from 'client/pages/Game/components/GameEnd/GameEnd';
import DotSeparator from 'client/components/common/DotSeparator/DotSeparator';

import userAtom from 'client/atoms/userAtom';

interface IPexesoGameProps {
  io: SocketIOClient.Socket;
  players: IPexesoPlayer[];
  isGameEnd: boolean;
}

const b = block('PexesoGame');

const Root = styled(Box)`
  .PexesoGame {
    &__card {
      background-size: contain;
      cursor: pointer;

      &_highlighted {
        position: relative;

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
      width: 80px;
      height: 80px;
      background: transparent;
      border: 1px solid black;
      border-radius: 8px;
    }

    &__player {
      &_isActive {
        font-weight: bold;
      }
    }
  }
`;

const {
  games: {
    [EGame.PEXESO]: {
      sets,
    },
  },
} = GAMES_CONFIG;

const PexesoGame: React.FC<IPexesoGameProps> = (props) => {
  const { io, isGameEnd, players: baseGamePlayers } = props;

  const [options, setOptions] = useState<IPexesoGameOptions | null>(null);
  const [cards, setCards] = useState<IPexesoCard[][]>([]);
  const [openedCardsCoords, setOpenedCardsCoords] = useState<IPexesoCardCoords[]>([]);
  const [highlightedCardsCoords, setHighlightedCardsCoords] = useState<IPexesoCardCoords[]>([]);
  const [players, setPlayers] = useState<IPexesoPlayer[]>([]);
  const imagesRef = useRef<HTMLImageElement[]>([]);

  const user = useRecoilValue(userAtom);

  const player = useMemo(() => {
    return players.find(({ login }) => login === user?.login);
  }, [players, user]);

  const handleCardClick = useCallback(({ x, y }: IPexesoCardCoords) => {
    if (!player?.isActive) {
      return;
    }

    setHighlightedCardsCoords([]);

    io.emit(EPexesoGameEvent.OPEN_CARD, { x, y });
  }, [io, player]);

  const handleCardRightClick = useCallback((e: React.MouseEvent, { x, y }: IPexesoCardCoords) => {
    e.preventDefault();

    const highlightedIndex = highlightedCardsCoords.findIndex((coords) => coords.x === x && coords.y === y);

    if (highlightedIndex === -1) {
      setHighlightedCardsCoords([
        ...highlightedCardsCoords,
        { x, y },
      ]);
    } else {
      setHighlightedCardsCoords([
        ...highlightedCardsCoords.slice(0, highlightedIndex),
        ...highlightedCardsCoords.slice(highlightedIndex + 1),
      ]);
    }
  }, [highlightedCardsCoords]);

  useEffect(() => {
    io.emit(EPexesoGameEvent.GET_GAME_INFO);

    io.on(EPexesoGameEvent.GAME_INFO, ({
      options,
      cards,
      players,
      openedCardsCoords,
    }: IPexesoGameInfoEvent) => {
      setOptions(options);
      setCards(cards);
      setOpenedCardsCoords(openedCardsCoords);
      setPlayers(players);
    });

    io.on(EPexesoGameEvent.OPEN_CARD, ({ x, y }: IPexesoCardCoords) => {
      setOpenedCardsCoords((prevOpenedCards) => [...prevOpenedCards, { x, y }]);
    });

    io.on(EPexesoGameEvent.HIDE_CARDS, () => {
      setOpenedCardsCoords([]);
      setHighlightedCardsCoords([]);
    });

    io.on(EPexesoGameEvent.REMOVE_CARDS, (removedCardsCoords: IPexesoCardCoords[]) => {
      setCards((cards) => {
        removedCardsCoords.forEach(({ x, y }) => {
          cards[y][x].isInGame = false;
        });

        return cards;
      });
      setHighlightedCardsCoords([]);
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

  const { set } = options;

  return (
    <Root className={b()} flex between={20}>
      <Box between={8}>
        {cards.map((row, y) => (
          <Box key={y} flex between={8}>
            {row.map((card, x) => (
              card.isInGame ? (
                <Img
                  key={x}
                  className={b('card', {
                    highlighted: highlightedCardsCoords.some((coords) => coords.x === x && coords.y === y),
                  })}
                  width={80}
                  height={80}
                  url={openedCardsCoords.some((card) => card.x === x && card.y === y) ?
                    `/pexeso/sets/${set}/${card.imageId}/${card.imageVariant}.jpg` :
                    '/pexeso/backs/default/2.jpg'
                  }
                  onClick={() => handleCardClick({ x, y })}
                  onContextMenu={(e) => handleCardRightClick(e, { x, y })}
                />
              ) : (
                <div key={x} className={b('empty')} />
              )
            ))}
          </Box>
        ))}
      </Box>

      {playersBlock}
    </Root>
  );
};

export default React.memo(PexesoGame);
