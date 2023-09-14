import { FC, memo } from 'react';

import { GameType } from 'common/types/game';

import Flex from 'client/components/common/Flex/Flex';

import { GameOptionsProps } from 'client/pages/Lobby/Lobby';

const CarcassonneGameOptions: FC<GameOptionsProps<GameType.CARCASSONNE>> = (props) => {
  const { options } = props;

  return <Flex alignItems="center">{options.withTimer ? 'На время' : 'Без времени'}</Flex>;
};

export default memo(CarcassonneGameOptions);
