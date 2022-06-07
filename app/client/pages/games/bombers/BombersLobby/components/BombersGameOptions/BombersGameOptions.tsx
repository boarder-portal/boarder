import { FC, memo } from 'react';

import { MAP_NAMES } from 'common/constants/games/bombers';

import { EGame } from 'common/types/game';

import Flex from 'client/components/common/Flex/Flex';

import { IGameOptionsProps } from 'client/pages/Lobby/Lobby';

const BombersGameOptions: FC<IGameOptionsProps<EGame.BOMBERS>> = (props) => {
  const { options } = props;

  return (
    <Flex direction="column" between={3}>
      {options.mapType === null ? 'Случайная карта' : `Карта "${MAP_NAMES[options.mapType]}"`}
    </Flex>
  );
};

export default memo(BombersGameOptions);
