import React  from 'react';
import styled from 'styled-components';
import block from 'bem-cn';

import { ISevenWondersPlayer } from 'common/types/sevenWonders';

import Box from 'client/components/common/Box/Box';
import Card from 'client/pages/Game/components/SevenWondersGame/components/Card/Card';
import useCardGroups from 'client/pages/Game/components/SevenWondersGame/components/Wonder/hooks/useCardGroups';
import BackCard from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/BackCard/BackCard';

interface IWonderProps {
  className?: string;
  player: ISevenWondersPlayer;
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
  const { className, player } = props;

  const cardGroups = useCardGroups(player);

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
                  width={100}
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
        {player.points > 0 && <div>{`Очки: ${player.points}`}</div>}
        <div>{`Монет: ${player.coins}`}</div>
        {Boolean(player.victoryPoints.length) && <div>{`Победы: ${player.victoryPoints.join(', ')}`}</div>}
        {Boolean(player.defeatPoints.length) && <div>{`Поражения: ${player.defeatPoints.join(', ')}`}</div>}
      </Box>
    </Root>
  );
};

export default React.memo(Wonder);
