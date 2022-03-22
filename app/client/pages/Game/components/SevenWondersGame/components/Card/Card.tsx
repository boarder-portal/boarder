import React, { useCallback } from 'react';
import styled from 'styled-components';
import block from 'bem-cn';

import { ESevenWonderCardId, ISevenWondersCard } from 'common/types/sevenWonders/cards';

import Box from 'client/components/common/Box/Box';

interface ICardProps {
  card: ISevenWondersCard;
  onBuild(card: ISevenWondersCard): void;
}

const b = block('Card');

const CARD_WIDTH = 110;
const CARD_PROPORTION = 0.6547;

const Root = styled(Box)`
  width: ${CARD_WIDTH}px;
  height: ${CARD_WIDTH / CARD_PROPORTION}px;

  &:hover {
    position: relative;
    z-index: 2;

    .Card {
      &__zoomWrapper {
        transform: scale(1.5) translateY(-50px);
      }

      &__options {
        position: relative;
        visibility: visible;
      }
    }
  }

  .Card {
    &__zoomWrapper {
      position: relative;
      width: 100%;
      height: 100%;
      transition: 200ms;
    }

    &__img {
      position: absolute;
      width: 100%;
      height: 100%;
    }

    &__options {
      visibility: hidden;
      color: white;

      & > div {
        cursor: pointer;
      }
    }
  }
`;

const Card: React.FC<ICardProps> = (props) => {
  const { card, onBuild } = props;

  const handleBuild = useCallback(() => {
    onBuild(card);
  }, [card, onBuild]);

  return (
    <Root className={b()}>
      <div className={b('zoomWrapper')}>
        <img className={b('img')} src={`/sevenWonders/cards/${card.id}.png`} />

        <Box className={b('options')} flex column between={20} alignItems="center">
          <div onClick={handleBuild}>Построить</div>
          <div>Заложить</div>
          <div>Продать</div>
        </Box>
      </div>
    </Root>
  );
};

export default React.memo(Card);
