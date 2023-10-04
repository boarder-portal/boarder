import { FC, memo, useCallback, useEffect, useMemo, useState } from 'react';

import { GameType } from 'common/types/game';
import { GameClientEventType } from 'common/types/games/set';

import { findSet } from 'common/utilities/games/set/set';

import useImmutableCallback from 'client/hooks/useImmutableCallback';

import Button from 'client/components/common/Button/Button';
import Flex from 'client/components/common/Flex/Flex';
import Text from 'client/components/common/Text/Text';
import { GameContentProps } from 'client/components/game/Game/Game';
import GameContent from 'client/components/game/GameContent/GameContent';
import Card from 'client/components/games/set/SetGame/components/SetGameContent/components/Card/Card';

import styles from './SetGameContent.module.scss';

const SetGameContent: FC<GameContentProps<GameType.SET>> = (props) => {
  const {
    io,
    gameInfo: { cards, players },
    gameResult,
  } = props;

  const [selectedCardsIndexes, setSelectedCardsIndexes] = useState<Set<number>>(new Set());

  const hintedSet = useMemo(() => {
    return findSet(cards);
  }, [cards]);

  const handleCardClick = useImmutableCallback((cardIndex: number) => {
    if (gameResult) {
      return;
    }

    const updatedSelectedCardsIndexes = new Set(selectedCardsIndexes);

    const isSelected = selectedCardsIndexes.has(cardIndex);

    if (isSelected) {
      updatedSelectedCardsIndexes.delete(cardIndex);

      setSelectedCardsIndexes(updatedSelectedCardsIndexes);
    } else {
      if (selectedCardsIndexes.size === 3) {
        return;
      }

      updatedSelectedCardsIndexes.add(cardIndex);

      setSelectedCardsIndexes(updatedSelectedCardsIndexes);

      if (updatedSelectedCardsIndexes.size === 3) {
        io.emit(GameClientEventType.SEND_SET, {
          cardsIndexes: [...updatedSelectedCardsIndexes],
        });
      }
    }
  });

  const handleNoSetClick = useCallback(() => {
    io.emit(GameClientEventType.SEND_NO_SET);
  }, [io]);

  // TODO: clear when board differs
  useEffect(() => {
    setSelectedCardsIndexes(new Set());
  }, [cards]);

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
    <GameContent game={GameType.SET}>
      <div className={styles.root}>
        <div className={styles.grid} style={{ '--columnsCount': Math.ceil(cards.length / 3) }}>
          {cards.map((card, cardIndex) => (
            <Card
              key={cardIndex}
              card={card}
              cardIndex={cardIndex}
              isSelected={selectedCardsIndexes.has(cardIndex)}
              isHinted={Boolean(process.env.NODE_ENV !== 'production' && hintedSet?.includes(cardIndex))}
              onClick={handleCardClick}
            />
          ))}
        </div>

        <Flex direction="column" between={5}>
          {playersBlock}

          {!gameResult && <Button onClick={handleNoSetClick}>Нет сета</Button>}

          {gameResult && (
            <Text weight="bold" size="l">
              Игра окончена
            </Text>
          )}
        </Flex>
      </div>
    </GameContent>
  );
};

export default memo(SetGameContent);
