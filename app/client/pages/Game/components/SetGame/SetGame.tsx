import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import block from 'bem-cn';
import { useRecoilValue } from 'recoil';
import chunk from 'lodash/chunk';

import { EGameEvent, ICard, IPlayer } from 'common/types/set';
import { IGameInfoEvent, ISendSetEvent } from 'common/types/set/events';

import Box from 'client/components/common/Box/Box';
import Card from 'client/pages/Game/components/SetGame/components/Card/Card';
import Button from 'client/components/common/Button/Button';

import userAtom from 'client/atoms/userAtom';
import useImmutableCallback from 'client/hooks/useImmutableCallback';

interface ISetGameProps {
  io: SocketIOClient.Socket;
  players: IPlayer[];
  isGameEnd: boolean;
}

const b = block('SetGame');

const Root = styled(Box)`
  display: flex;

  .SetGame {
    &__info  {
      margin-left: 40px;
    }
  }

  @media (max-width: 500px) {
    flex-direction: column;

    .SetGame {
      &__info  {
        margin-top: 20px;
      }
    }
  }
`;

const SetGame: React.FC<ISetGameProps> = (props) => {
  const { io, isGameEnd } = props;

  const [cards, setCards] = useState<ICard[]>([]);
  const [players, setPlayers] = useState<IPlayer[]>([]);
  const [selectedCardsIds, setSelectedCardsIds] = useState<Set<number>>(new Set());

  const playerRef = useRef<IPlayer | null>(null);

  const user = useRecoilValue(userAtom);

  const handleCardClick = useImmutableCallback((card: ICard) => {
    if (isGameEnd) {
      return;
    }

    const updatedSelectedCardsIds = new Set(selectedCardsIds);

    const isSelected = selectedCardsIds.has(card.id);

    if (isSelected) {
      updatedSelectedCardsIds.delete(card.id);

      setSelectedCardsIds(updatedSelectedCardsIds);
    } else {
      if (selectedCardsIds.size === 3) {
        return;
      }

      updatedSelectedCardsIds.add(card.id);

      setSelectedCardsIds(updatedSelectedCardsIds);

      if (updatedSelectedCardsIds.size === 3) {
        const data: ISendSetEvent = {
          cardsIds: [...updatedSelectedCardsIds],
        };

        console.log('SEND_SET', data);

        io.emit(EGameEvent.SEND_SET, data);
      }
    }
  });

  const handleNoSetClick = useCallback(() => {
    io.emit(EGameEvent.SEND_NO_SET);
  }, [io]);

  useEffect(() => {
    io.emit(EGameEvent.GET_GAME_INFO);

    io.on(EGameEvent.GAME_INFO, (gameInfo: IGameInfoEvent) => {
      console.log('GAME_INFO', gameInfo);

      if (!user) {
        return;
      }

      const player = playerRef.current = gameInfo.players.find(({ login }) => login === user.login) || null;

      if (!player) {
        return;
      }

      setCards(gameInfo.cards);
      setPlayers(gameInfo.players);
      setSelectedCardsIds(new Set());
    });

    return () => {
      io.off(EGameEvent.GAME_INFO);
    };
  }, [io, user]);

  const playersBlock = useMemo(() => {
    return (
      <Box between={8}>
        <Box bold size="l">Игроки: </Box>

        {players.map((player) => (
          <Box key={player.login}>{player.login}: {player.score}</Box>
        ))}
      </Box>
    );
  }, [players]);

  return (
    <Root className={b()}>
      <Box
        className={b('board')}
        between={20}
      >
        {chunk(cards, cards.length / 3).map((cardsRow, index) => (
          <Box key={index} flex between={20}>
            {cardsRow.map((card, cardRowIndex) => (
              <Card
                key={cardRowIndex}
                card={card}
                isSelected={selectedCardsIds.has(card.id)}
                onClick={handleCardClick}
              />
            ))}
          </Box>
        ))}
      </Box>

      <Box
        className={b('info')}
        between={20}
      >
        {playersBlock}

        {!isGameEnd && <Button onClick={handleNoSetClick}>Нет сета</Button>}

        {isGameEnd && <Box bold size="l">Игра окончена</Box>}
      </Box>
    </Root>
  );
};

export default React.memo(SetGame);
