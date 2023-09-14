import { FC, memo } from 'react';

import { GameType } from 'common/types/game';

import useImmutableCallback from 'client/hooks/useImmutableCallback';

import Checkbox from 'client/components/common/Checkbox/Checkbox';
import Flex from 'client/components/common/Flex/Flex';

import { CreateGameOptionsProps } from 'client/pages/Lobby/Lobby';

const CarcassonneCreateGameOptions: FC<CreateGameOptionsProps<GameType.CARCASSONNE>> = (props) => {
  const { options, changeOptions } = props;

  const handleWithTimerChange = useImmutableCallback((withTimer: boolean) => {
    changeOptions({
      withTimer,
    });
  });

  return (
    <Flex direction="column" between={3}>
      <Checkbox checked={options.withTimer} label="На время" onChange={handleWithTimerChange} />
    </Flex>
  );
};

export default memo(CarcassonneCreateGameOptions);
