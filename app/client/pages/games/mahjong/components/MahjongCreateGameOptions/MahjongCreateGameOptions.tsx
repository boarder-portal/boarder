import { FC, memo } from 'react';

import { EGame } from 'common/types/game';
import { EHandsCount } from 'common/types/mahjong';

import useImmutableCallback from 'client/hooks/useImmutableCallback';

import Flex from 'client/components/common/Flex/Flex';
import Select from 'client/components/common/Select/Select';

import { ICreateGameOptionsProps } from 'client/pages/Lobby/Lobby';

const HANDS_COUNT: Record<EHandsCount, number> = {
  [EHandsCount.ONE]: 1,
  [EHandsCount.FOUR]: 4,
  [EHandsCount.SIXTEEN]: 16,
};

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
          text: HANDS_COUNT[handsCount],
          value: handsCount,
        }))}
        onChange={handleHandsCountChange}
      />
    </Flex>
  );
};

export default memo(MahjongCreateGameOptions);
