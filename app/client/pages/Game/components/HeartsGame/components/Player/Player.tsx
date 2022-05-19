import React, { useMemo } from 'react';
import classNames from 'classnames';

import { ESuit } from 'common/types/cards';
import { EHandStage, IPlayer } from 'common/types/hearts';

import { EPlayerPosition } from 'client/pages/Game/components/HeartsGame/utilities/getPlayerPosition';

import Box from 'client/components/common/Box/Box';
import Hand from 'client/pages/Game/components/HeartsGame/components/Hand/Hand';
import Card from 'client/pages/Game/components/HeartsGame/components/Hand/components/Card/Card';

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
    <Box
      className={classNames(
        styles.root,
        position === EPlayerPosition.LEFT || position === EPlayerPosition.RIGHT ? styles[position] : undefined,
        className,
      )}
      flex
      alignItems="center"
      column={position === EPlayerPosition.BOTTOM || position === EPlayerPosition.TOP}
      reverseDirection={position === EPlayerPosition.LEFT || position === EPlayerPosition.TOP}
      between={20}
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

      <Box flex column alignItems="center">
        <Box size="xl" bold>
          {player.login}
        </Box>
        <Box size="l">{player.data.score}</Box>
      </Box>
    </Box>
  );
};

export default React.memo(Player);
