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
  IPexesoGameInfoEvent,
  IPexesoCardCoords,
  IPexesoPlayer,
  IPexesoGameOptions,
} from 'common/types/pexeso';

import Img from 'client/components/common/Img/Img';
import Box from 'client/components/common/Box/Box';

import userAtom from 'client/atoms/userAtom';

interface IPexesoGameProps {
  io: SocketIOClient.Socket;
}

const b = block('PexesoGame');

const Root = styled(Box)`
  .PexesoGame {
    &__card {
      cursor: pointer;
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
    pexeso: {
      sets: {
        common: commonSet,
      },
    },
  },
} = GAMES_CONFIG;

const PexesoGame: React.FC<IPexesoGameProps> = (props) => {
  const { io } = props;

  const [options, setOptions] = useState<IPexesoGameOptions | null>(null);
  const [cards, setCards] = useState<IPexesoCard[][]>([]);
  const [openedCardsCoords, setOpenedCardsCoords] = useState<IPexesoCardCoords[]>([]);
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

    io.emit(EGameEvent.GAME_EVENT, EPexesoGameEvent.OPEN_CARD, { x, y });
  }, [io, player]);

  useEffect(() => {
    io.emit(EGameEvent.GAME_EVENT, EPexesoGameEvent.GET_GAME_INFO);

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
    });

    io.on(EPexesoGameEvent.REMOVE_CARDS, (removedCardsCoords: IPexesoCardCoords[]) => {
      setCards((cards) => {
        removedCardsCoords.forEach(({ x, y }) => {
          cards[y][x].isInGame = false;
        });

        return cards;
      });
    });

    io.on(EPexesoGameEvent.UPDATE_PLAYERS, (players: IPexesoPlayer[]) => {
      setPlayers(players);
    });
  }, [io]);

  useEffect(() => {
    if (!options) {
      return;
    }

    times(commonSet.width * commonSet.height / options.sameCardsCount, (id) => {
      const image = new Image();

      image.src = `/pexeso/sets/${options.set}/${id}/0.jpg`;

      imagesRef.current.push(image);
    });
  }, [options]);

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
                  className={b('card')}
                  width={80}
                  height={80}
                  url={openedCardsCoords.find((card) => card.x === x && card.y === y) ?
                    `/pexeso/sets/${set}/${card.id}/0.jpg` :
                    '/pexeso/backs/default/2.jpg'
                  }
                  onClick={() => handleCardClick({ x, y })}
                />
              ) : (
                <div key={x} className={b('empty')} />
              )
            ))}
          </Box>
        ))}
      </Box>

      <Box between={8}>
        {players.map((localPlayer) => (
          <Box
            key={localPlayer.login}
            className={b('player', { isActive: localPlayer.isActive })}
          >
            {`${localPlayer.login} ${localPlayer.score}`}
          </Box>
        ))}
      </Box>
    </Root>

  );
};

export default React.memo(PexesoGame);
