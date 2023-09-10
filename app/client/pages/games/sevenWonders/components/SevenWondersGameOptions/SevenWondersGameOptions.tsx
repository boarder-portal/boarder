import React, { FC, memo } from 'react';

import { GameType } from 'common/types/game';

import Flex from 'client/components/common/Flex/Flex';

import { GameOptionsProps } from 'client/pages/Lobby/Lobby';

const SevenWondersGameOptions: FC<GameOptionsProps<GameType.SEVEN_WONDERS>> = (props) => {
  const { options } = props;

  return <Flex>{options.includeLeaders && 'С лидерами'}</Flex>;
};

export default memo(SevenWondersGameOptions);
