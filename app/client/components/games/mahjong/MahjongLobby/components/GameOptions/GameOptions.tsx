import { FC, memo } from 'react';

import { GameType } from 'common/types/game';
import { HandsCount } from 'common/types/games/mahjong';

import Flex from 'client/components/common/Flex/Flex';
import { GameOptionsProps } from 'client/components/game/Lobby/Lobby';

const HANDS_COUNT: Record<HandsCount, string> = {
  [HandsCount.ONE]: '1 раздача',
  [HandsCount.FOUR]: '4 раздачи',
  [HandsCount.SIXTEEN]: '16 раздач',
};

const GameOptions: FC<GameOptionsProps<GameType.MAHJONG>> = (props) => {
  const { options } = props;

  return <Flex alignItems="center">{HANDS_COUNT[options.handsCount]}</Flex>;
};

export default memo(GameOptions);
