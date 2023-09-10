import { FC, memo } from 'react';

import { GameType } from 'common/types/game';
import { HandsCount } from 'common/types/mahjong';

import Flex from 'client/components/common/Flex/Flex';

import { GameOptionsProps } from 'client/pages/Lobby/Lobby';

const HANDS_COUNT: Record<HandsCount, string> = {
  [HandsCount.ONE]: '1 раздача',
  [HandsCount.FOUR]: '4 раздачи',
  [HandsCount.SIXTEEN]: '16 раздач',
};

const MahjongGameOptions: FC<GameOptionsProps<GameType.MAHJONG>> = (props) => {
  const { options } = props;

  return <Flex>{HANDS_COUNT[options.handsCount]}</Flex>;
};

export default memo(MahjongGameOptions);
