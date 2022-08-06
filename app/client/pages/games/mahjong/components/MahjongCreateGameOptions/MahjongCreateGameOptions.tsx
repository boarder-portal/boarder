import { FC, memo } from 'react';

import { HAND_COUNTS } from 'common/constants/games/mahjong';

import { EGame } from 'common/types/game';
import { EHandsCount } from 'common/types/mahjong';

import useImmutableCallback from 'client/hooks/useImmutableCallback';

import Flex from 'client/components/common/Flex/Flex';
import Select from 'client/components/common/Select/Select';

import { ICreateGameOptionsProps } from 'client/pages/Lobby/Lobby';

const MahjongCreateGameOptions: FC<ICreateGameOptionsProps<EGame.MAHJONG>> = (props) => {
  const { options, changeOptions } = props;

  const handleHandsCountChange = useImmutableCallback((handsCount: EHandsCount) => {
    changeOptions({
      handsCount,
    });
  });

  return (
    <Flex direction="column" between={3}>
      <Select
        label="Количество раздач"
        value={options.handsCount}
        options={Object.values(EHandsCount).map((handsCount) => ({
          text: HAND_COUNTS[handsCount],
          value: handsCount,
        }))}
        onChange={handleHandsCountChange}
      />
    </Flex>
  );
};

export default memo(MahjongCreateGameOptions);
