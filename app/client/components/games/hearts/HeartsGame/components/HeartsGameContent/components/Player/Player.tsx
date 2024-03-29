import classNames from 'classnames';
import { FC, memo, useMemo } from 'react';

import { WithClassName } from 'client/types/react';
import { Suit } from 'common/types/game/cards';
import { HandStage, Player as PlayerModel } from 'common/types/games/hearts';

import { PlayerPosition } from 'client/components/games/hearts/HeartsGame/components/HeartsGameContent/utilities/getPlayerPosition';

import Flex, { FlexProps } from 'client/components/common/Flex/Flex';
import Text from 'client/components/common/Text/Text';
import Hand from 'client/components/games/hearts/HeartsGame/components/HeartsGameContent/components/Hand/Hand';
import Card from 'client/components/games/hearts/HeartsGame/components/HeartsGameContent/components/Hand/components/Card/Card';

import styles from './Player.module.scss';

interface PlayerProps extends WithClassName {
  player: PlayerModel;
  position: PlayerPosition;
  isActive: boolean;
  stage: HandStage;
  playedSuit: Suit | null;
  heartsEnteredPlay: boolean;
  isOwnHand: boolean;
  isFirstTurn: boolean;
  onSelectCard(cardIndex: number): void;
}

function getFlexDirection(position: PlayerPosition): FlexProps['direction'] {
  if (position === PlayerPosition.TOP) {
    return 'columnReverse';
  }

  if (position === PlayerPosition.BOTTOM) {
    return 'column';
  }

  if (position === PlayerPosition.LEFT) {
    return 'rowReverse';
  }

  return 'row';
}

const Player: FC<PlayerProps> = (props) => {
  const {
    className,
    player,
    position,
    isActive,
    stage,
    playedSuit,
    heartsEnteredPlay,
    isOwnHand,
    isFirstTurn,
    onSelectCard,
  } = props;

  const hand = useMemo(() => player.data.hand?.hand ?? [], [player.data.hand]);

  const chosenCardsIndexes = useMemo(() => player.data.hand?.chosenCardsIndexes ?? [], [player.data.hand]);

  return (
    <Flex
      className={classNames(
        styles.root,
        position === PlayerPosition.LEFT || position === PlayerPosition.RIGHT ? styles[position] : undefined,
        className,
      )}
      alignItems="center"
      direction={getFlexDirection(position)}
      between={5}
    >
      {player.data.turn?.playedCard && <Card card={player.data.turn.playedCard} isVisible />}

      <Hand
        className={styles.hand}
        isActive={isActive}
        hand={hand}
        chosenCardsIndexes={chosenCardsIndexes}
        stage={stage}
        playedSuit={playedSuit}
        heartsEnteredPlay={heartsEnteredPlay}
        isOwnHand={isOwnHand}
        isFirstTurn={isFirstTurn}
        onSelectCard={onSelectCard}
      />

      <Flex direction="column" alignItems="center">
        <Text size="xl" weight="bold">
          {player.name}
        </Text>
        <Text size="l">{player.data.score}</Text>
      </Flex>
    </Flex>
  );
};

export default memo(Player);
