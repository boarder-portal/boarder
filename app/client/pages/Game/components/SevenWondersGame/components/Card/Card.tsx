import React, { CSSProperties, useCallback } from 'react';
import styled from 'styled-components';
import block from 'bem-cn';

import { ISevenWondersCard } from 'common/types/sevenWonders/cards';

import Box from 'client/components/common/Box/Box';

interface ICardProps {
  className?: string;
  style?: CSSProperties;
  card: ISevenWondersCard;
  isBuilt: boolean;
  width?: number;
  onBuild?(card: ISevenWondersCard): void;
}

interface IRootProps extends Pick<ICardProps, 'width' | 'isBuilt'>{}

const b = block('Card');

const CARD_WIDTH = 110;
const CARD_PROPORTION = 0.6547;

const Root = styled(Box)`
  width: ${({ width }: IRootProps) => width || CARD_WIDTH}px;
  height: ${({ width }: IRootProps) => (width || CARD_WIDTH) / CARD_PROPORTION}px;

  &:hover {
    position: relative;
    z-index: 21 !important;

    &.Card_built_no {
      .Card__zoomWrapper {
        transform: scale(1.5) translateY(-50px);
      }

      .Card__options {
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
  const { className, style, card, isBuilt, width, onBuild } = props;

  const handleBuild = useCallback(() => {
    onBuild?.(card);
  }, [card, onBuild]);

  return (
    <Root className={b({ built: isBuilt ? 'yes' : 'no' }).mix(className)} style={style} width={width} isBuilt={isBuilt}>
      <div className={b('zoomWrapper')}>
        <img className={b('img')} src={`/sevenWonders/cards/${card.id}.jpg`} />

        {!isBuilt && (
          <Box className={b('options')} flex column between={20} alignItems="center">
            <div onClick={handleBuild}>Построить</div>
            <div>Заложить</div>
            <div>Продать</div>
          </Box>
        )}
      </div>
    </Root>
  );
};

export default React.memo(Card);
