import { FC, memo, useCallback } from 'react';

import { GameType } from 'common/types/game';

import Checkbox from 'client/components/common/Checkbox/Checkbox';
import Flex from 'client/components/common/Flex/Flex';

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
    <Flex direction="column" between={3}>
      <Checkbox label="С лидерами" checked={options.includeLeaders} onChange={handleIncludeLeadersChange} />
    </Flex>
  );
};

export default memo(SevenWondersCreateGameOptions);
