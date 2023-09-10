import React, { FC, memo } from 'react';

import { MAP_NAMES } from 'common/constants/games/bombers';

import { GameType } from 'common/types/game';

import DotSeparator from 'client/components/common/DotSeparator/DotSeparator';
import Flex from 'client/components/common/Flex/Flex';

import { GameOptionsProps } from 'client/pages/Lobby/Lobby';

const BombersGameOptions: FC<GameOptionsProps<GameType.BOMBERS>> = (props) => {
  const { options } = props;

  return (
    <Flex>
      {options.mapType === null ? 'Случайная карта' : `Карта "${MAP_NAMES[options.mapType]}"`}

      <DotSeparator />

      {options.withAbilities ? 'Со способностями' : 'Без способностей'}
    </Flex>
  );
};

export default memo(BombersGameOptions);
