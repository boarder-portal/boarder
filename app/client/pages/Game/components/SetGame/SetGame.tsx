import React, { useCallback, useEffect, useMemo, useState } from 'react';
import chunk from 'lodash/chunk';

import { EGameEvent, ICard, IPlayer, ISendSetEvent } from 'common/types/set';
import { EGame } from 'common/types/game';

import Box from 'client/components/common/Box/Box';
import Card from 'client/pages/Game/components/SetGame/components/Card/Card';
import Button from 'client/components/common/Button/Button';

import useImmutableCallback from 'client/hooks/useImmutableCallback';
import { IGameProps } from 'client/pages/Game/Game';

import styles from './SetGame.pcss';

const SetGame: React.FC<IGameProps<EGame.SET>> = (props) => {
  const { io, gameInfo, isGameEnd } = props;

  const [cards, setCards] = useState<ICard[]>([]);
  const [players, setPlayers] = useState<IPlayer[]>([]);
  const [selectedCardsIds, setSelectedCardsIds] = useState<Set<number>>(new Set());

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
    setCards(gameInfo.cards);
    setPlayers(gameInfo.players);
    setSelectedCardsIds(new Set());
  }, [gameInfo.cards, gameInfo.players]);

  const playersBlock = useMemo(() => {
    return (
      <Box between={8}>
        <Box bold size="l">
          Игроки:{' '}
        </Box>

        {players.map((player) => (
          <Box key={player.login}>
            {player.login}: {player.data.score}
          </Box>
        ))}
      </Box>
    );
  }, [players]);

  return (
    <Box className={styles.root}>
      <Box between={20}>
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

      <Box className={styles.info} between={20}>
        {playersBlock}

        {!isGameEnd && <Button onClick={handleNoSetClick}>Нет сета</Button>}

        {isGameEnd && (
          <Box bold size="l">
            Игра окончена
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default React.memo(SetGame);
