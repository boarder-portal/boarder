import React from 'react';
import styled from 'styled-components';
import block from 'bem-cn';

import { EMeepleType, EPlayerColor } from 'common/types/carcassonne';

import Box from 'client/components/common/Box/Box';

interface IMeepleProps {
  className?: string;
  style?: React.CSSProperties;
  type: EMeepleType;
  color: EPlayerColor;
  onClick?(): void;
}

const b = block('Meeple');

const Root = styled(Box)`
  .Meeple {
    &__meeple {
      border: 1px solid #000;

      &_type_COMMON {
        width: 75%;
        height: 75%;
      }

      &_type_FAT {
        width: 100%;
        height: 100%;
      }

      &_type_BUILDER {
        width: 40%;
        height: 100%;
      }

      &_type_PIG {
        width: 100%;
        height: 60%;
        border-radius: 50%;
      }
    }
  }
`;

const Meeple: React.FC<IMeepleProps> = (props) => {
  const { className, style, type, color, onClick } = props;

  return (
    <Root className={b.mix(className)} style={style} flex alignItems="center" justifyContent="center" onClick={onClick}>
      <div className={b('meeple', { type })} style={{ backgroundColor: color }} />
    </Root>
  );
};

export default React.memo(Meeple);
