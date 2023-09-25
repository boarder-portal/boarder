import { FC, memo, useCallback } from 'react';

import { GameType } from 'common/types/game';

import Checkbox from 'client/components/common/Checkbox/Checkbox';

import { CreateGameOptionsProps } from 'client/pages/Lobby/Lobby';

const SevenWondersCreateGameOptions: FC<CreateGameOptionsProps<GameType.SEVEN_WONDERS>> = (props) => {
  const { options, changeOptions } = props;

  const handleIncludeLeadersChange = useCallback(
    (includeLeaders: boolean) => {
      changeOptions({
        includeLeaders,
      });
    },
    [changeOptions],
  );

  return (
    <>
      <Checkbox label="С лидерами" checked={options.includeLeaders} onChange={handleIncludeLeadersChange} />
    </>
  );
};

export default memo(SevenWondersCreateGameOptions);
