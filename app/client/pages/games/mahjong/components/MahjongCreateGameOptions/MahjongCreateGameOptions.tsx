import { FC, memo } from 'react';

import { HAND_COUNTS } from 'common/constants/games/mahjong';

import { GameType } from 'common/types/game';
import { HandsCount } from 'common/types/games/mahjong';

import useImmutableCallback from 'client/hooks/useImmutableCallback';

import Flex from 'client/components/common/Flex/Flex';
import Select from 'client/components/common/Select/Select';

import { CreateGameOptionsProps } from 'client/pages/Lobby/Lobby';

const MahjongCreateGameOptions: FC<CreateGameOptionsProps<GameType.MAHJONG>> = (props) => {
  const { options, changeOptions } = props;

  const handleHandsCountChange = useImmutableCallback((handsCount: HandsCount) => {
    changeOptions({
      handsCount,
    });
  });

  return (
    <Flex direction="column" between={3}>
      <Select
        label="Количество раздач"
        value={options.handsCount}
        options={Object.values(HandsCount).map((handsCount) => ({
          text: HAND_COUNTS[handsCount],
          value: handsCount,
        }))}
        onChange={handleHandsCountChange}
      />
    </Flex>
  );
};

export default memo(MahjongCreateGameOptions);
