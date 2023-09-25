import { FC, memo } from 'react';

import { GameType } from 'common/types/game';

import useImmutableCallback from 'client/hooks/useImmutableCallback';

import Checkbox from 'client/components/common/Checkbox/Checkbox';

import { CreateGameOptionsProps } from 'client/pages/Lobby/Lobby';

const CarcassonneCreateGameOptions: FC<CreateGameOptionsProps<GameType.CARCASSONNE>> = (props) => {
  const { options, changeOptions } = props;

  const handleWithTimerChange = useImmutableCallback((withTimer: boolean) => {
    changeOptions({
      withTimer,
    });
  });

  return (
    <>
      <Checkbox checked={options.withTimer} label="На время" onChange={handleWithTimerChange} />
    </>
  );
};

export default memo(CarcassonneCreateGameOptions);
