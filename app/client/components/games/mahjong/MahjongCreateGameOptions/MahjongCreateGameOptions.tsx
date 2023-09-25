import { FC, memo } from 'react';

import { HAND_COUNTS } from 'common/constants/games/mahjong';

import { GameType } from 'common/types/game';
import { HandsCount } from 'common/types/games/mahjong';

import useImmutableCallback from 'client/hooks/useImmutableCallback';

import Select from 'client/components/common/Select/Select';
import { CreateGameOptionsProps } from 'client/components/game/Lobby/Lobby';

const MahjongCreateGameOptions: FC<CreateGameOptionsProps<GameType.MAHJONG>> = (props) => {
  const { options, changeOptions } = props;

  const handleHandsCountChange = useImmutableCallback((handsCount: HandsCount) => {
    changeOptions({
      handsCount,
    });
  });

  return (
    <>
      <Select
        label="Количество раздач"
        value={options.handsCount}
        options={Object.values(HandsCount).map((handsCount) => ({
          text: HAND_COUNTS[handsCount],
          value: handsCount,
        }))}
        onChange={handleHandsCountChange}
      />
    </>
  );
};

export default memo(MahjongCreateGameOptions);
