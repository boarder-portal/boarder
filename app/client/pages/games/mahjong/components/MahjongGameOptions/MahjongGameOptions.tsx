import { FC, memo } from 'react';

import { EGame } from 'common/types/game';
import { EHandsCount } from 'common/types/mahjong';

import Flex from 'client/components/common/Flex/Flex';

import { IGameOptionsProps } from 'client/pages/Lobby/Lobby';

const HANDS_COUNT: Record<EHandsCount, string> = {
  [EHandsCount.ONE]: '1 раздача',
  [EHandsCount.FOUR]: '4 раздачи',
  [EHandsCount.SIXTEEN]: '16 раздач',
};

const MahjongGameOptions: FC<IGameOptionsProps<EGame.MAHJONG>> = (props) => {
  const { options } = props;

  return <Flex>{HANDS_COUNT[options.handsCount]}</Flex>;
};

export default memo(MahjongGameOptions);
