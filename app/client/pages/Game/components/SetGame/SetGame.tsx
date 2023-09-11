import chunk from 'lodash/chunk';
import { FC, memo, useCallback, useEffect, useMemo, useState } from 'react';

import { GameType } from 'common/types/game';
import { Card as CardModel, GameClientEventType, Player, SendSetEvent } from 'common/types/games/set';

import useImmutableCallback from 'client/hooks/useImmutableCallback';

import Button from 'client/components/common/Button/Button';
import Flex from 'client/components/common/Flex/Flex';
import Text from 'client/components/common/Text/Text';
import Card from 'client/pages/Game/components/SetGame/components/Card/Card';

import { GameProps } from 'client/pages/Game/Game';

import styles from './SetGame.module.scss';

const SetGame: FC<GameProps<GameType.SET>> = (props) => {
  const { io, gameInfo, gameResult } = props;

  const [cards, setCards] = useState<CardModel[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedCardsIds, setSelectedCardsIds] = useState<Set<number>>(new Set());

  const handleCardClick = useImmutableCallback((card: CardModel) => {
    if (gameResult) {
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
        const data: SendSetEvent = {
          cardsIds: [...updatedSelectedCardsIds],
        };

        console.log('SEND_SET', data);

        io.emit(GameClientEventType.SEND_SET, data);
      }
    }
  });

  const handleNoSetClick = useCallback(() => {
    io.emit(GameClientEventType.SEND_NO_SET);
  }, [io]);

  useEffect(() => {
    setCards(gameInfo.cards);
    setPlayers(gameInfo.players);
    setSelectedCardsIds(new Set());
  }, [gameInfo.cards, gameInfo.players]);

  const playersBlock = useMemo(() => {
    return (
      <Flex direction="column" between={2}>
        <Text weight="bold" size="l">
          Игроки:{' '}
        </Text>

        {players.map((player) => (
          <div key={player.login}>
            {player.name}: {player.data.score}
          </div>
        ))}
      </Flex>
    );
  }, [players]);

  return (
    <div className={styles.root}>
      <Flex direction="column" between={5}>
        {chunk(cards, cards.length / 3).map((cardsRow, index) => (
          <Flex key={index} between={5}>
            {cardsRow.map((card, cardRowIndex) => (
              <Card
                key={cardRowIndex}
                card={card}
                isSelected={selectedCardsIds.has(card.id)}
                onClick={handleCardClick}
              />
            ))}
          </Flex>
        ))}
      </Flex>

      <Flex className={styles.info} direction="column" between={5}>
        {playersBlock}

        {!gameResult && <Button onClick={handleNoSetClick}>Нет сета</Button>}

        {gameResult && (
          <Text weight="bold" size="l">
            Игра окончена
          </Text>
        )}
      </Flex>
    </div>
  );
};

export default memo(SetGame);
