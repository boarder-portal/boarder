import React, { useMemo } from 'react';
import classNames from 'classnames';

import { ESuit } from 'common/types/cards';
import { EHandStage, IPlayer } from 'common/types/hearts';

import { EPlayerPosition } from 'client/pages/Game/components/HeartsGame/utilities/getPlayerPosition';

import Hand from 'client/pages/Game/components/HeartsGame/components/Hand/Hand';
import Card from 'client/pages/Game/components/HeartsGame/components/Hand/components/Card/Card';
import Text from 'client/components/common/Text/Text';
import Flex, { IFlexProps } from 'client/components/common/Flex/Flex';

import styles from './Player.pcss';

interface IPlayerProps {
  className?: string;
  player: IPlayer;
  position: EPlayerPosition;
  isActive: boolean;
  stage: EHandStage;
  playedSuit: ESuit | null;
  heartsEnteredPlay: boolean;
  isOwnHand: boolean;
  isFirstTurn: boolean;
  onSelectCard(cardIndex: number): void;
}

function getFlexDirection(position: EPlayerPosition): IFlexProps['direction'] {
  if (position === EPlayerPosition.TOP) {
    return 'columnReverse';
  }

  if (position === EPlayerPosition.BOTTOM) {
    return 'column';
  }

  if (position === EPlayerPosition.LEFT) {
    return 'rowReverse';
  }

  return 'row';
}

const Player: React.FC<IPlayerProps> = (props) => {
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
        position === EPlayerPosition.LEFT || position === EPlayerPosition.RIGHT ? styles[position] : undefined,
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
          {player.login}
        </Text>
        <Text size="l">{player.data.score}</Text>
      </Flex>
    </Flex>
  );
};

export default React.memo(Player);
