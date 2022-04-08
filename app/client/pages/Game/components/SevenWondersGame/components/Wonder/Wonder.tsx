import React, { useMemo } from 'react';
import styled from 'styled-components';
import block from 'bem-cn';

import { ESevenWondersAdditionalActionType, ISevenWondersPlayer } from 'common/types/sevenWonders';
import { ESevenWondersFreeCardSource } from 'common/types/sevenWonders/effects';

import { isTradeEffect } from 'common/utilities/sevenWonders/isEffect';

import Box from 'client/components/common/Box/Box';
import Card from 'client/pages/Game/components/SevenWondersGame/components/Card/Card';
import useCardGroups from 'client/pages/Game/components/SevenWondersGame/components/Wonder/hooks/useCardGroups';
import BackCard from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/BackCard/BackCard';

interface IWonderProps {
  className?: string;
  player: ISevenWondersPlayer;
  isOtherPlayer?: boolean;
}

const b = block('Wonder');

const GROUP_HEIGHT = 125;
const CARD_DEFAULT_GROUP_VERTICAL_SPACE = 33;

const Root = styled(Box)`
  .Wonder {
    &__cardGroups {
      height: ${GROUP_HEIGHT}px;
    }

    &__cardGroup {
      width: 100px;
      position: relative;
    }

    &__card {
      position: absolute;
    }

    &__wonderImageWrapper {
      position: relative;
    }

    &__wonderCard {
      position: relative;
      width: 100%;
      z-index: 20;
    }

    &__builtStage {
      position: absolute;
      bottom: -10px;
    }
  }
`;

const Wonder: React.FC<IWonderProps> = (props) => {
  const { className, player, isOtherPlayer } = props;

  const cardGroups = useCardGroups(player);

  const currentAction = useMemo(() => {
    if (player.waitingAdditionalAction?.type === ESevenWondersAdditionalActionType.BUILD_CARD) {
      const buildEffect = player.buildCardEffects[player.waitingAdditionalAction.buildEffectIndex];

      if (buildEffect.source === ESevenWondersFreeCardSource.DISCARD) {
        return 'Выбор из сброса';
      }

      return 'Строительство последней карты';
    }

    if (!player.actions.length) {
      return 'Выбирает карту';
    }

    return 'Ожидает';
  }, [player]);

  const warPoints = useMemo(() => [...player.victoryPoints, ...player.defeatPoints], [player.defeatPoints, player.victoryPoints]);

  return (
    <Root className={b.mix(className)}>
      <Box className={b('cardGroups')} flex justifyContent="space-between">
        {cardGroups.map((group, index) => {
          const cardVerticalSpace = Math.min(GROUP_HEIGHT / group.length, CARD_DEFAULT_GROUP_VERTICAL_SPACE);

          return (
            <div className={b('cardGroup')} key={index}>
              {group.map((card, cardIndex) => (
                <Card
                  key={cardIndex}
                  className={b('card')}
                  style={{ top: `${(GROUP_HEIGHT - cardVerticalSpace * (cardIndex + 1))}px`, zIndex: 10 - cardIndex }}
                  card={card}
                  flip={isOtherPlayer && card.effects.some((effect) =>
                    isTradeEffect(effect) && effect.neighbors.length === 1)}
                  width={100}
                  zoomOnHover
                />
              ))}
            </div>
          );
        })}
      </Box>

      <div className={b('wonderImageWrapper')}>
        <img className={b('wonderCard')} src={`/sevenWonders/cities/${player.city}/${player.citySide}.png`} />

        {player.builtStages.map((builtStage, index) => (
          <BackCard key={index} className={b('builtStage')} age={builtStage.cardAge} style={{ left: `${9 + 30 * index}%` }} />
        ))}
      </div>

      <Box flex between={8} mt={16}>
        <div>{player.login}</div>
        {player.points > 0 && <div>{`Очки: ${player.points}`}</div>}
        <div>{`Монет: ${player.coins}`}</div>
        {warPoints.length ? <div>{`Война ${warPoints.join(', ')}`}</div> : null}
        <div>{currentAction}</div>
      </Box>
    </Root>
  );
};

export default React.memo(Wonder);
