import React, { useMemo } from 'react';
import styled from 'styled-components';
import block from 'bem-cn';
import { groupBy } from 'lodash';
import sortBy from 'lodash/sortBy';

import { ISevenWondersPlayer } from 'common/types/sevenWonders';
import { ESevenWondersCardType, ISevenWondersCard } from 'common/types/sevenWonders/cards';

import Box from 'client/components/common/Box/Box';
import Card from 'client/pages/Game/components/SevenWondersGame/components/Card/Card';

interface IWonderProps {
  className?: string;
  player: ISevenWondersPlayer;
}

const b = block('Wonder');

const Root = styled(Box)`
  .Wonder {
    &__cardGroups {
      height: 150px;
    }

    &__cardGroup {
      width: 100px;
      position: relative;
    }

    &__card {
      position: absolute;
    }

    &__wonderCard {
      position: relative;
      width: 100%;
      z-index: 20;
    }
  }
`;

const Wonder: React.FC<IWonderProps> = (props) => {
  const { className, player } = props;

  const cardGroups = useMemo(() => {
    const groupedCards = Object.entries(groupBy(
      player.builtCards,
      ({ type }) =>
        type === ESevenWondersCardType.RAW_MATERIAL ||
        type === ESevenWondersCardType.MANUFACTURED_GOODS ? 'resources' : type,
    )) as [ESevenWondersCardType | 'resources', ISevenWondersCard[]][];

    const sortedGroups = sortBy(groupedCards, ([type, group]) => {
      if (type === 'resources') {
        return -Infinity;
      }

      return -group.length;
    });

    return sortedGroups.map(([, group]) => group);
  }, [player.builtCards]);

  return (
    <Root className={b.mix(className)}>
      <Box className={b('cardGroups')} flex justifyContent="space-between">
        {cardGroups.map((group, index) => (
          <div className={b('cardGroup')} key={index}>
            {group.map((card, cardIndex) => (
              <Card
                key={cardIndex}
                className={b('card')}
                style={{ bottom: `${-(100 - 20 * (cardIndex + 1))}%`, zIndex: 10 - cardIndex }}
                card={card}
                isBuilt
                width={100}
              />
            ))}
          </div>
        ))}
      </Box>

      <img className={b('wonderCard')} src={`/sevenWonders/cities/${player.city}/${player.citySide}.png`} />
    </Root>
  );
};

export default React.memo(Wonder);
