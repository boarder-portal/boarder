import { FC, memo, useMemo } from 'react';

import { ALL_LANDMARK_CARDS } from 'common/constants/games/machiKoro';

import { WithClassName } from 'client/types/react';
import { CardId, CardType, LandmarkId, Player as PlayerModel } from 'common/types/games/machiKoro';

import isNotUndefined from 'common/utilities/isNotUndefined';
import getCard from 'common/utilities/machiKoro/getCard';

import usePrevious from 'client/hooks/usePrevious';

import Flex from 'client/components/common/Flex/Flex';
import Image from 'client/components/common/Image/Image';
import Text from 'client/components/common/Text/Text';
import Card from 'client/pages/Game/components/MachiKoroGame/components/Card/Card';
import CardLine from 'client/pages/Game/components/MachiKoroGame/components/CardLine/CardLine';

import styles from './Player.module.scss';

interface PlayerProps extends WithClassName {
  player: PlayerModel;
  main?: boolean;
  active: boolean;
  dices: number[];
  withActions?: boolean;
  forbiddenToClickCardTypes: CardType[];
  onEndTurn(): void;
  onCardClick?(playerIndex: number, cardId: CardId): void;
  onLandmarkBuild(id: LandmarkId): void;
  onClick?(): void;
}

const Player: FC<PlayerProps> = (props) => {
  const { className, player, withActions, forbiddenToClickCardTypes, onClick, onLandmarkBuild, onCardClick } = props;

  const {
    data: { coins },
  } = player;

  const prevCoins = usePrevious(coins);
  const coinsChange = coins - prevCoins;

  const disabledCardsIds = useMemo(
    () =>
      player.data.cardsIds
        .map((cardId) => {
          const card = getCard(cardId);

          if (!onCardClick) {
            return undefined;
          }

          return forbiddenToClickCardTypes.includes(card.type) ? cardId : undefined;
        })
        .filter(isNotUndefined),
    [forbiddenToClickCardTypes, onCardClick, player.data.cardsIds],
  );

  return (
    <Flex className={className} direction="column" between={2}>
      <Flex between={3} alignItems="center">
        <Text weight="bold" onClick={onClick}>
          {player.name}
        </Text>

        <Flex between={2} alignItems="center">
          <Image className={styles.coin} src="/coin.png" />

          <div className={styles.coinsCount}>{`${coins}${
            coinsChange === 0 ? '' : `(${coinsChange > 0 ? '+' : ''}${coinsChange})`
          }`}</div>
        </Flex>

        <Flex between={2}>
          {ALL_LANDMARK_CARDS.map((landmark) => {
            const hasBuilt = player.data.landmarksIds.includes(landmark.id);

            return (
              <Card
                className={styles.landmark}
                key={landmark.id}
                id={landmark.id}
                inactive={!hasBuilt}
                zoom="extra"
                onClick={hasBuilt || !withActions || coins < landmark.cost ? undefined : onLandmarkBuild}
              />
            );
          })}
        </Flex>
      </Flex>

      <CardLine
        cardsIds={player.data.cardsIds}
        disabledIds={disabledCardsIds}
        onClick={onCardClick ? (cardId) => onCardClick(player.index, cardId) : undefined}
      />
    </Flex>
  );
};

export default memo(Player);
