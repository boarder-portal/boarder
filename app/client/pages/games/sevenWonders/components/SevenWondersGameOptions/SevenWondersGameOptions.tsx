import React, { FC, memo } from 'react';

import { EGame } from 'common/types/game';

import Flex from 'client/components/common/Flex/Flex';

import { IGameOptionsProps } from 'client/pages/Lobby/Lobby';

const SevenWondersGameOptions: FC<IGameOptionsProps<EGame.SEVEN_WONDERS>> = (props) => {
  const { options } = props;

  return <Flex>{options.includeLeaders && 'С лидерами'}</Flex>;
};

export default memo(SevenWondersGameOptions);
