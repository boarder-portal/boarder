import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import block from 'bem-cn';
import { useRecoilValue } from 'recoil';
import chunk from 'lodash/chunk';

import {
  ESetGameEvent, ISetCard,
  ISetPlayer,
} from 'common/types/Set';
import { ISetGameInfoEvent, ISetSendSetEvent } from 'common/types/set/events';

import Box from 'client/components/common/Box/Box';
import Card from 'client/pages/Game/components/SetGame/components/Card/Card';
import Button from 'client/components/common/Button/Button';

import userAtom from 'client/atoms/userAtom';

interface ISetGameProps {
  io: SocketIOClient.Socket;
  players: ISetPlayer[];
  isGameEnd: boolean;
}

const b = block('SetGame');

const Root = styled(Box)`

`;

const SetGame: React.FC<ISetGameProps> = (props) => {
  const { io, isGameEnd } = props;

  const [cards, setCards] = useState<ISetCard[]>([]);
  const [players, setPlayers] = useState<ISetPlayer[]>([]);
  const [selectedCardsIds, setSelectedCardsIds] = useState<number[]>([]);

  const playerRef = useRef<ISetPlayer | null>(null);

  const user = useRecoilValue(userAtom);

  const handleCardClick = useCallback((card: ISetCard) => {
    if (isGameEnd) {
      return;
    }

    const selectedCardsIdsIndex = selectedCardsIds
      .findIndex((id) => id === card.id);

    if (selectedCardsIdsIndex === -1) {
      if (selectedCardsIds.length === 3) {
        return;
      }

      const updatedSelectedCardsIds = [...selectedCardsIds, card.id];

      setSelectedCardsIds(updatedSelectedCardsIds);

      if (updatedSelectedCardsIds.length === 3) {
        const data: ISetSendSetEvent = {
          cardsIds: updatedSelectedCardsIds,
        };

        console.log('SEND_SET', data);

        io.emit(ESetGameEvent.SEND_SET, data);
      }
    } else {
      setSelectedCardsIds([
        ...selectedCardsIds.slice(0, selectedCardsIdsIndex),
        ...selectedCardsIds.slice(selectedCardsIdsIndex + 1),
      ]);
    }
  }, [io, isGameEnd, selectedCardsIds]);

  const handleNoSetClick = useCallback(() => {
    io.emit(ESetGameEvent.SEND_NO_SET);
  }, [io]);

  useEffect(() => {
    io.emit(ESetGameEvent.GET_GAME_INFO);

    io.on(ESetGameEvent.GAME_INFO, (gameInfo: ISetGameInfoEvent) => {
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
      setSelectedCardsIds([]);
    });

    return () => {
      io.off(ESetGameEvent.GAME_INFO);
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
    <Root className={b()} flex between={40}>
      <Box between={20}>
        {chunk(cards, cards.length / 3).map((cardsRow, index) => (
          <Box key={index} flex between={20}>
            {cardsRow.map((card, cardRowIndex) => (
              <Card
                key={cardRowIndex}
                card={card}
                isSelected={selectedCardsIds.includes(card.id)}
                onClick={handleCardClick.bind(null, card)}
              />
            ))}
          </Box>
        ))}
      </Box>

      <Box between={20}>
        {playersBlock}

        {!isGameEnd && <Button onClick={handleNoSetClick}>Нет сета</Button>}

        {isGameEnd && <Box bold size="l">Игра окончена</Box>}
      </Box>
    </Root>
  );
};

export default React.memo(SetGame);
