import { FC, memo, useMemo } from 'react';

import { ALL_LANDMARK_CARDS } from 'common/constants/games/machiKoro';

import { ECardId, ECardType, ELandmarkId, EPlayerWaitingAction, IPlayer } from 'common/types/machiKoro';

import getCard from 'common/utilities/machiKoro/getCard';

import Flex from 'client/components/common/Flex/Flex';
import Text from 'client/components/common/Text/Text';
import Card from 'client/pages/Game/components/MachiKoroGame/components/Card/Card';

interface IPlayerProps {
  player: IPlayer;
  active: boolean;
  dices: number[];
  withActions: boolean;
  forbiddenToClickCardTypes: ECardType[];
  onEndTurn(): void;
  onCardClick?(playerIndex: number, cardId: ECardId): void;
  onLandmarkBuild(id: ELandmarkId): void;
  onClick?(): void;
}

const Player: FC<IPlayerProps> = (props) => {
  const { player, active, dices, withActions, forbiddenToClickCardTypes, onClick, onLandmarkBuild, onCardClick } =
    props;

  const status = useMemo(() => {
    if (!active) {
      return null;
    }

    if (player.data.waitingAction === EPlayerWaitingAction.CHOOSE_PLAYER) {
      return 'Выбирает у кого взять монеты';
    }

    if (player.data.waitingAction === EPlayerWaitingAction.CHOOSE_CARDS_TO_SWAP) {
      return 'Выбирает карты для обмена';
    }

    return 'Ходит';
  }, [active, player.data.waitingAction]);

  return (
    <Flex direction="column" between={2} style={{ flex: '1 1 50%' }}>
      <Text weight="bold" onClick={onClick}>
        {player.name}
      </Text>

      <Flex between={2} alignItems="center">
        <div>Монеты: {player.data.coins}</div>
        {status && <div>{status}</div>}
        {Boolean(dices.length) && <div>{`Кубик${dices.length === 2 ? 'и' : ''}: ${dices.join(',')}`}</div>}
      </Flex>

      <Flex between={2}>
        {ALL_LANDMARK_CARDS.map((landmark) => {
          const hasBuilt = player.data.landmarksIds.includes(landmark.id);

          return (
            <Card
              key={landmark.id}
              id={landmark.id}
              inactive={!hasBuilt}
              onClick={hasBuilt || !withActions || player.data.coins < landmark.cost ? undefined : onLandmarkBuild}
            />
          );
        })}
      </Flex>

      <Flex between={2}>
        {player.data.cardsIds.map((cardId, index) => {
          const card = getCard(cardId);
          const isForbiddenToClick = forbiddenToClickCardTypes.includes(card.type);

          return (
            <Card
              key={index}
              id={cardId}
              onClick={onCardClick && !isForbiddenToClick ? (cardId) => onCardClick(player.index, cardId) : undefined}
            />
          );
        })}
      </Flex>
    </Flex>
  );
};

export default memo(Player);
